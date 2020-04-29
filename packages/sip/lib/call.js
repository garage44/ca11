class Call {
    /**
    * @param {AppBackground} app - The background application.
    * @param {Object} [description] - SIP call description.
    * @param {Boolean} [options.active] - Activates this Call in the UI.
    * @param {Boolean} [options.silent] - Setup a Call without interfering with the UI.
    */
    constructor(app, description) {
        // super(app, description)

        this.tracks = {}
        this.state.protocol = 'sip'

        // Passing in a session in the description makes this an incoming call.
        if (description.session) {
            app._mergeDeep(this.state, {direction: 'incoming', status: 'invite'})
            this.session = description.session
        } else {
            app._mergeDeep(this.state, {direction: 'outgoing', number: description.endpoint, status: 'new'})
        }
    }


    /**
    * Convert a comma-separated string like:
    * `SIP;cause=200;text="Call completed elsewhere` to a Map.
    * @param {String} header - The header to parse.
    * @returns {Map} - A map of key/values of the header.
    */
    _parseHeader(header) {
        return new Map(header.replace(/"/g, '').split(';').map((i) => i.split('=')))
    }


    accept() {
        this.session.on('trackAdded', this.onTrack.bind(this))
        this.session.accept({
            sessionDescriptionHandlerOptions: {
                constraints: this.app.media._getUserMediaFlags(),
            },
        })
    }


    hold() {
        this.session.hold({
            sessionDescriptionHandlerOptions: {
                constraints: this.app.media._getUserMediaFlags(),
            },
        })
        this.setState({hold: {active: true}})
    }


    incoming() {
        this.app.logger.debug(`${this}incoming call ${this.id} started`)

        this.state.number = this.session.assertedIdentity.uri.user
        this.state.name = this.session.assertedIdentity.displayName

        super.incoming()

        this.session.on('accepted', () => {
            this._start({message: this.translations.accepted})
        })

        this.session.on('bye', () => {
            this.setState({status: 'bye'})
            this._stop({message: this.translations[this.state.status]})
        })

        /**
        * The `failed` status is triggered when a call is rejected, but
        * also when an incoming calls keeps ringing for a certain amount
        * of time (60 seconds), and fails due to a timeout. In that case,
        * no `rejected` event is triggered and we need to kill the
        * call ASAP, so a new INVITE for the same call will be accepted by
        * the call module's invite handler.
        */
        this.session.on('failed', (message) => {
            if (typeof message === 'string') message = this.app.modules.sip.SIP.Parser.parseMessage(message, this.app.sip.ua)
            let reason = message.getHeader('Reason')
            let status = 'caller_unavailable'

            if (reason) reason = this._parseHeader(reason).get('text')

            if (reason === 'Call completed elsewhere') {
                status = 'answered_elsewhere'
            } else if (message.status_code === 480) {
                // The accepting party terminated the incoming call.
                status = 'callee_unavailable'
            }

            super.terminate(status)
        })

        this.session.on('reinvite', (session) => {
            this.app.logger.debug(`${this}<event:reinvite>`)
            // Seems to be a timing issue in SIP.js. After a transfer,
            // the old name is keps in assertedIdentity, unless a timeout
            // is added.
            setTimeout(() => {
                this.state.name = session.assertedIdentity.uri.user
                this.state.number = session.assertedIdentity.uri.user
            }, 0)
        })
    }


    onTrack() {
        const pc = this.session.sessionDescriptionHandler.peerConnection
        const receivers = pc.getReceivers()
        if (!receivers.length) return

        const newTracks = []
        for (const receiver of receivers) {
            if (!this.tracks[receiver.track.id]) {
                this.tracks[receiver.track.id] = receiver.track
                newTracks.push(receiver.track)
            }
        }
        if (!newTracks.length) return

        for (const track of newTracks) {
            const newStream = new MediaStream()
            const path = `caller.calls.${this.id}.streams.${newStream.id}`

            track.onunmute = () => {this.app.setState({muted: false}, {path})}
            track.onmute = () => {this.app.setState({muted: true}, {path})}
            track.onended = () => {
                this.app.logger.debug(`${this}remove ${track.kind} track ${track.id}`)
                delete this.tracks[track.id]
                this._cleanupStream(newStream.id)
            }

            newStream.addTrack(track)
            this.app.logger.info(`${this}${track.kind} track added: ${track.id}`)
            this.addStream(newStream, track.kind)
            this.app.logger.debug(`${this}stream added to view: ${newStream.id}`)
        }
    }


    outgoing() {
        super.outgoing()
        const uri = `sip:${this.state.endpoint}@${this.app.state.sip.endpoint.split('/')[0]}`


        const stream = this.app.state.settings.webrtc.media.stream
        const localStream = this.app.media.streams[stream[stream.type].id]

        console.log("CALL INVITE", localStream)
        this.ua.invite('1000', localStream)


        this.session = this.app.sip.ua.invite(uri)

        this.setState({stats: {callId: this.session.request.call_id}})
        this.session.on('trackAdded', this.onTrack.bind(this))
        this.session.on('accepted', () => {
            this.app.logger.debug(`${this}<event:accepted>`)
            this._start({message: this.translations.accepted})
        })
        this.session.on('bye', () => {
            this.app.logger.debug(`${this}<event:bye>`)
            super.terminate('bye')
        })

        /**
        * Play a ringback tone on the following status codes:
        * 180: Ringing
        * 181: Call is Being Forwarded
        * 182: Queued
        * 183: Session in Progress
        */
        this.session.on('progress', (e) => {
            this.app.logger.debug(`${this}<event:progress>`)
            if ([180, 181, 182, 183].includes(e.status_code)) {
                this.app.sounds.ringbackTone.play()
            }
        })

        // Blind transfer.
        this.session.on('refer', () => {
            this.app.logger.debug(`${this}<event:refer>`)
            this.session.bye()
        })

        // The user is being transferred; update the caller info
        // from the P-Asserted-Identity header.
        this.session.on('reinvite', (session) => {
            this.app.logger.debug(`${this}<event:reinvite>`)
            // Seems to be a timing issue in SIP.js. After a transfer,
            // the old name is keps in assertedIdentity, unless a timeout
            // is added.
            setTimeout(() => {
                if (session.assertedIdentity) {
                    this.state.name = session.assertedIdentity.uri.user
                    this.state.number = session.assertedIdentity.uri.user
                } else {
                    this.state.name = session.remoteIdentity.uri.user
                    this.state.number = session.remoteIdentity.uri.user
                }
            }, 0)
        })

        this.session.on('failed', (message) => {
            let status = 'callee_unavailable'
            // 486 - Busy here; Callee is busy.
            // 487 - Request terminated; Request has terminated by bye or cancel.
            if (message.status_code === 486) {
                status = 'callee_busy'
            } else if (message.status_code === 487) {
                status = 'caller_unavailable'
            }

            super.terminate(status)
        })
    }


    terminate() {
        const status = this.state.status
        try {
            if (status === 'accepted') this.session.bye()
            else if (status === 'create' && this.session) this.session.terminate()
            else if (status === 'invite') this.session.reject()
        } catch (err) {
            this.app.logger.error(err)
        }
    }


    toString() {
        return `${this.app}[CallSIP][${this.id}] `
    }


    transfer(targetCall) {
        if (typeof targetCall === 'string') {
            this.session.refer(`sip:${targetCall}@ca11.app`)
        } else {
            this.session.refer(targetCall.session)
        }
    }


    unhold() {
        if (this.session) {
            this.session.unhold({
                sessionDescriptionHandlerOptions: {
                    constraints: this.app.media._getUserMediaFlags(),
                },
            })
            this.setState({hold: {active: false}})
        }
    }
}

export default Call
