/**
* @module ModuleCalls
*/
import Call from '../call.js'

/**
* Call implementation for incoming and outgoing calls
* using WebRTC and SIP.js.
*/
class CallSIP extends Call {
    /**
    * @param {AppBackground} app - The background application.
    * @param {Object} [description] - SIP call description.
    * @param {Boolean} [options.active] - Activates this Call in the UI.
    * @param {Boolean} [options.silent] - Setup a Call without interfering with the UI.
    */
    constructor(app, description) {
        super(app, description)

        this.state.protocol = 'sip'

        // Created from an invite means that the session is
        // already there, e.g. this is an incoming call.
        if (description.session) {
            // Passing in a session as target means an incoming call.
            app._mergeDeep(this.state, {
                direction: 'incoming',
                status: 'invite',
            })
            this.session = description.session
        } else {
            // Passing in no target or a number means an outgoing call.
            app._mergeDeep(this.state, {
                direction: 'outgoing',
                number: description.endpoint,
                status: 'new',
            })
        }
    }


    /**
    * Convert a comma-separated string like:
    * `SIP;cause=200;text="Call completed elsewhere` to a Map.
    * @param {String} header - The header to parse.
    * @returns {Map} - A map of key/values of the header.
    */
    _parseHeader(header) {
        return new Map(header.replace(/\"/g, '').split(';').map((i) => i.split('=')))
    }


    /**
    * Accept an incoming session.
    */
    accept() {
        super.accept()
        // Handle connecting streams to the appropriate video element.
        this.session.on('track', this.onTrack.bind(this))
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


    /**
    * Handle an incoming `invite` call from.
    */
    incoming() {
        this.state.number = this.session.assertedIdentity.uri.user
        this.state.name = this.session.assertedIdentity.displayName

        this.app.logger.debug(`${this}incoming call ${this.id} started`)
        super.incoming()

        // Setup some event handlers for the different stages of a call.
        this.session.on('accepted', (request) => {
            this._start({message: this.translations.accepted})
        })

        this.session.on('bye', (e) => {
            this.setState({status: 'bye'})
            this._stop({message: this.translations[this.state.status]})
        })

        /**
        * The `failed` status is triggered when a call is rejected, but
        * also when an incoming calls keeps ringing for a certain amount
        * of time (60 seconds), and fails due to a timeout. In that case,
        * no `rejected` event is triggered and we need to kill the
        * call ASAP, so a new INVITE for the same call will be accepted by the
        * call module's invite handler.
        */
        this.session.on('failed', (message) => {
            if (typeof message === 'string') message = SIP.Parser.parseMessage(message, this.app.sip.ua)
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

        this.session.on('reinvite', (session, request) => {
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


    /**
    * Handle Track event, when a new MediaStreamTrack is
    * added to an RTCRtpReceiver.
    * @param {RTCTrackEvent} e - Contains track information.
    */
    onTrack(e) {
        this.app.logger.debug(`${this}<event:onTrack>`)
        let stream = e.streams[0]

        // The audio track of the stream is always added first.
        // There is only one audio track in each call.
        if (e.track.kind === 'audio') {
            this.audioTrackEvent = e
            // The video track from Asterisk sharing the same stream id
            // as the audio is not an active video stream and is removed
            // from the scene.
            stream.getVideoTracks().forEach((t) => {
                stream.removeTrack(t)
            })
            // Add an invisible audio stream.
            this.addStream(stream, 'audio', false)
        } else {
            if (this.audioTrackEvent.streams[0].id !== stream.id) {
                stream.addTrack(this.audioTrackEvent.track)
                this.addStream(stream, 'video')
            }
        }

        const path = `caller.calls.${this.id}.streams.${stream.id}`
        e.track.onunmute = () => {this.app.setState({muted: false}, {path})}
        e.track.onmute = () => {this.app.setState({muted: true}, {path})}
        e.track.onended = () => {
            this._cleanupStream(stream.id)
        }
    }


    /**
    * Setup an outgoing call.
    */
    outgoing() {
        super.outgoing()
        const uri = `sip:${this.state.endpoint}@${this.app.state.sip.endpoint.split('/')[0]}`
        this.session = this.app.sip.ua.invite(uri, {
            sessionDescriptionHandlerOptions: {
                constraints: this.app.media._getUserMediaFlags(),
            },
        })

        this.setState({stats: {callId: this.session.request.call_id}})
        // Handle connecting streams to the appropriate video element.
        this.session.on('track', this.onTrack.bind(this))

        // Notify user about the new call being setup.
        this.session.on('accepted', (data) => {
            this.app.logger.debug(`${this}<event:accepted>`)
            this._start({message: this.translations.accepted})
        })

        // Reset call state when the other halve hangs up.
        this.session.on('bye', (e) => {
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
        this.session.on('refer', (target) => {
            this.app.logger.debug(`${this}<event:refer>`)
            this.session.bye()
        })

        // The user is being transferred; update the caller
        // info from the P-Asserted-Identity header.
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


    /**
    * Terminate a SIP Call.
    */
    terminate() {
        const status = this.state.status
        try {
            if (status === 'accepted') this.session.bye()
            else if (status === 'create' && this.session) this.session.terminate()
            else if (status === 'invite') this.session.reject()
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err)
        }
    }


    /**
    * Generate a representational name for this module. Used for logging.
    * @returns {String} - An identifier for this module.
    */
    toString() {
        return `${this.app}[CallSIP][${this.id}] `
    }


    transfer(targetCall) {
        if (typeof targetCall === 'string') {
            this.session.refer(`sip:${targetCall}@ca11.io`)
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

export default CallSIP
