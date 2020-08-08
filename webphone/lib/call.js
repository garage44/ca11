import CallSig11 from '@ca11/sig11/call.js'
import CallSip from '@ca11/sip/call.js'

const callHandlers = {
    sig11: CallSig11,
    sip: CallSip,
}


class Call {

    constructor(app, description) {
        this.app = app
        this.id = shortid()
        app.logger.info(`${this}new ${description.protocol} call`)

        this.streams = {}
        this.trackStream = {}
        // Holds contextual information about tracks/streams.
        this.trackInfo = {}
        this._started = false

        this.busyTone = app.sounds.busyTone
        this.translations = app.helpers.getTranslations().call

        this.state = {
            active: true,
            endpoint: null,
            hangup: {disabled: false},
            hold: {active: false, disabled: false},
            id: this.id,
            mute: {active: false},
            name: null,
            status: null,
            streams: {},
            timer: {current: null, start: null},
            transfer: {
                active: false,
                disabled: false,
                type: 'attended',
            },
        }

        app._mergeDeep(this.state, {
            direction: description.direction,
            protocol: description.protocol,
            status: description.direction === 'incoming' ? 'invite' : 'new',
        })

        const client = this.app.clients[description.protocol]

        // Call handler is passed from the SIP/SIG11 module.
        if (description.direction === 'incoming') {
            this.handler = description.handler
        } else if (description.direction === 'outgoing') {
            this.handler = new callHandlers[description.protocol](client, {description, id: this.id})
        }

        this.handler.on('terminate', () => {
            this.setState({status: 'bye'})
            this.finishCall()
        })

        this.handler.on('track', (track) => {
            const trackStream = this.addStream(track)
            const path = `caller.calls.${this.id}.streams.${trackStream.id}`
            track.onunmute = () => this.app.setState({muted: false}, {path})
            track.onmute = () => this.app.setState({muted: true}, {path})

            if (this.trackInfo[track.id]) {
                this.app.setState(this.trackInfo[track.id], {path})
                delete this.trackInfo[track.id]
            }
        })

        this.handler.on('track-ended', (track) => {
            this.app.logger.debug(`${this}remove track stream ${track.kind} track ${track.id}`)

            delete this.trackInfo[track.id]

            this.removeStream(this.trackStream[track.id])
            delete this.trackStream[track.id]
        })

        // Additional stream/track information; e.g. name/endpoint.
        this.handler.on('track-info', (trackId, trackInfo) => {
            if (trackInfo.action === 'leave') {
                delete this.trackInfo[trackId]
            } else {
                // The stream is already connected; update its info.
                if (this.trackStream[trackId]) {
                    const path = `caller.calls.${this.id}.streams.${this.trackStream[trackId].id}`
                    this.app.setState(trackInfo, {path})
                } else {
                    // The track info was emitted before the track event; store
                    // the state to be added in the track event.
                    this.trackInfo[trackId] = trackInfo
                }
            }
        })

        this.handler.on('outgoing-accepted', () => {
            this.app.logger.debug(`${this}outgoing call accepted`)
            this.startCall()
        })

        this.handler.on('invite-accepted', () => {
            this.app.logger.debug(`${this}invite accepted`)
            this.startCall()
        })
    }


    acceptCall() {
        const stream = this.app.state.settings.webrtc.media.stream
        const localStream = this.app.media.streams[stream[stream.type].id]
        this.handler.acceptCall(localStream)
    }


    addStream(track) {
        const trackStream = new MediaStream()
        trackStream.addTrack(track)
        this.trackStream[track.id] = trackStream

        const streamState = {
            id: trackStream.id,
            info: {
                endpoint: '',
                name: '',
            },
            kind: track.kind,
            local: false,
            muted: false,
            ready: false,
            visible: true,
        }

        this.app.media.streams[trackStream.id] = trackStream
        const path = `caller.calls.${this.id}.streams.${trackStream.id}`
        // The stream's state is initialized here.
        this.app.setState(streamState, {path})
        return trackStream
    }


    finishCall({timeout = 1000} = {}) {
        this.app.logger.debug(`${this}call is stopping in ${timeout}ms`)

        const streamType = this.app.state.settings.webrtc.media.stream.type
        this.app.setState({
            settings: {webrtc: {media: {stream: {[streamType]: {selected: false}}}}},
        })

        // Stop all call state sounds that may still be playing.
        this.app.sounds.ringbackTone.stop()
        this.app.sounds.ringTone.stop()
        this.app.sounds.callEnd.play()

        let message = `${new Date().toLocaleTimeString()} [${this.state.protocol.toUpperCase()}] - `
        let title = `${this.state.endpoint}`
        if (this.state.name) title += ` - ${this.state.name}`

        const fromto = {incoming: this.app.$t('from'), outgoing: this.app.$t('to')}
        const failCodes = ['callee_busy', 'callee_unavailable', 'caller_unavailable']
        if (failCodes.includes(this.state.status)) {
            title += ` (${this.app.$t(this.translations[this.state.status])})`
            message += this.app.$t('missed call {fromto} {name}', {
                fromto: fromto[this.state.direction],
                name: this.state.name ? this.state.name : this.state.endpoint,
            }).ca()
            this.app.emit('caller:call-rejected', {call: this.state}, true)
        } else {
            title += ` (${this.timer().formatted})`
            message = this.app.$t('finished call {fromto} {name} after {time}', {
                fromto: fromto[this.state.direction],
                name: this.state.name ? this.state.name : this.state.endpoint,
                time: this.timer().formatted,
            }).ca()

            this.app.emit('caller:call-ended', {call: this.state}, true)
        }

        this.app.modules.ui.notification({message, number: this.state.endpoint, stack: true, title})

        // Remove the streams that are associated with this call.
        for (const stream of Object.values(this.streams)) {
            this.app.logger.debug(`${this}removing stream ${stream.id}`)
            this.removeStream(stream)
        }

        clearInterval(this.timerId)
        // Reset the transfer state of target calls in case the transfer mode
        // of this Call is active and the callee ends the call.
        if (this.state.transfer.active) {
            this.app.modules.caller.transferState(this, false)
        }

        this.busyTone.stop()
        window.setTimeout(() => this.app.modules.caller.deleteCall(this), timeout)
    }


    initIncoming({context, handler}) {
        this.setState(this.state)

        if (this.silent) return

        const streamType = this.app.state.settings.webrtc.media.stream.type
        // Switch to the stream-view and activate the local stream.
        this.app.setState({
            settings: {webrtc: {media: {stream: {[streamType]: {selected: true}}}}},
            ui: {layer: 'stream-view', menubar: {event: 'ringing'}},
        })

        if (this.app.state.settings.webhooks.enabled) {
            const url = this.app.state.settings.webhooks.url
            window.open(url.replace('{endpoint}', this.state.endpoint), '_blank', 'alwaysLowered=yes')
        }

        this.app.modules.caller.activateCall(this, true)
        this.app.sounds.ringTone.play({loop: true})

        const stream = this.app.state.settings.webrtc.media.stream
        const localStream = this.app.media.streams[stream[stream.type].id]

        this.handler.initIncoming({context, handler, localStream})
    }


    async initSinks() {
        let outputSink
        const devices = this.app.state.settings.webrtc.devices
        if (devices.speaker.enabled) outputSink = devices.sinks.speakerOutput.id
        else outputSink = devices.sinks.headsetOutput.id

        this.app.logger.debug(`${this}change sink of remote video element to ${outputSink}`)
        // Chrome Android doesn't have setSinkId.
        if (this.app.media.fallback.remote.setSinkId) {
            try {
                await this.app.media.fallback.remote.setSinkId(outputSink)
            } catch (err) {
                const message = this.app.$t('failed to set output device!')
                this.app.notify({icon: 'warning', message, type: 'danger'})
                // eslint-disable-next-line no-console
                console.error(err)
            }
        }
    }


    inviteRemote() {
        // Try to fill in the name from contacts.
        const contacts = this.app.state.contacts.contacts
        let name = ''
        for (const id of Object.keys(contacts)) {
            if (contacts[id].endpoint === parseInt(this.endpoint)) {
                name = contacts[id].name
            }
        }

        // Always set this call to be the active call.
        this.app.modules.caller.activateCall(this, true)
        this.setState({name, status: 'create'})
        this.app.setState({ui: {layer: 'stream-view'}})

        const stream = this.app.state.settings.webrtc.media.stream
        const localStream = this.app.media.streams[stream[stream.type].id]
        this.handler.inviteRemote(localStream)
    }


    removeStream(stream) {
        this.app.logger.debug(`${this}remove stream: ${stream.id}`)
        const path = `caller.calls.${this.id}.streams.${stream.id}`
        this.app.setState(null, {action: 'delete', path})
        delete this.app.media.streams[stream.id]
    }


    setState(state) {
        // This merges to the call's local state; not the app's state!
        this.app._mergeDeep(this.state, state)
    }


    startCall() {
        this._started = true
        this.app.sounds.ringbackTone.stop()
        this.app.sounds.ringTone.stop()

        this.setState({
            status: 'accepted',
            timer: {
                current: new Date().getTime(),
                start: new Date().getTime(),
            },
        })

        const streamType = this.app.state.settings.webrtc.media.stream.type
        this.app.setState({
            settings: {
                webrtc: {media: {stream: {[streamType]: {
                    info: {
                        endpoint: this.handler.client.endpoint,
                        name: this.handler.client.name,
                    },
                    selected: new Date().getTime(),
                }}}},
            },
            ui: {menubar: {event: 'calling'}},
        })

        // Start the call timer.
        this.timerId = window.setInterval(() => {
            this.setState({timer: {current: new Date().getTime()}})
        }, 1000)
    }


    terminate(status = 'bye') {
        this.handler.terminate()
        // if (!status) {
        //     if (this.state.status === 'accepted') status = 'bye'
        //     else if (this.state.status === 'create') status = 'caller_unavailable'
        //     else if (this.state.status === 'invite') status = 'callee_busy'
        // }

    }


    timer() {
        const hours = Math.trunc((this.state.timer.current - this.state.timer.start) / 1000 / 60 / 60) % 24
        const minutes = Math.trunc((this.state.timer.current - this.state.timer.start) / 1000 / 60) % 60
        const seconds = Math.trunc((this.state.timer.current - this.state.timer.start) / 1000) % 60

        let formatted
        if (minutes <= 9) formatted = `0${minutes}`
        else formatted = `${minutes}`
        if (seconds <= 9) formatted = `${formatted}:0${seconds}`
        else formatted = `${formatted}:${seconds}`
        return {
            formatted, hours, minutes, seconds,
        }
    }

    toString() {
        return `[call] [${this.id}] `
    }

}


export default Call
