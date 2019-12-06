/**
* @module ModuleCalls
*/

/**
 * Base Call class that each implementation of a Call must use.
 * Currently used by CallConnectAB and CallSIP.
 */
class Call {
    /**
     * Initialize a new Call object by setting up some Call sounds
     * and set initial state. This state is shared by the UI of
     * AppForeground and the backend of AppBackground.
     * @param {AppBackground} app - The background application.
     * @param {Object} description - Generic Call options.
     */
    constructor(app, description) {
        this.app = app

        // References to MediaStream objects related to this call.
        this.streams = {}
        this._started = false

        this.busyTone = app.sounds.busyTone
        this.translations = app.helpers.getTranslations().call

        if (!description.id) this.id = shortid.generate()
        else this.id = description.id

        /**
         * @property {Object} state - Reactive computed properties from Vue-stash.
         * @property {Boolean} state.active - Whether the Call shows in the UI or not.
         * @property {String} state.class - Used to identify the Call type with.
         * @property {String} state.name - The name to show when calling.
         * @property {String} state.number - The Call's number.
         * @property {Object} state.hangup - Specifies the hangup feature of a Call.
         * @property {Object} state.hold - Specifies the hold feature of a Call.
         * @property {String} state.id - The generated UUID of the Call.
         * @property {Object} state.keypad - Whether the type of Call supports a keypad feature.
         * @property {String} state.protocol - Protocol that the Call uses.
         * @property {String} state.status - A Call state identifier as described in `this._statusMap`.
         * @property {Object} state.timer - Keeps track of the Call time.
         * @property {Object} state.transfer - Specifies the transfer feature of a Call.
         * @property {String} state.type - Either `incoming` or `outgoing`.
         */
        this.state = {
            active: true,
            direction: null, // incoming or outgoing
            hangup: {
                disabled: false,
            },
            hold: {
                active: false,
                disabled: false,
            },
            id: this.id,
            keypad: {
                active: false,
                disabled: false,
                number: null,
            },
            mute: {
                active: false,
            },
            name: null,
            number: null,
            protocol: null,
            status: null,
            streams: {},
            timer: {
                current: null,
                start: null,
            },
            transfer: {
                active: false,
                disabled: false,
                type: 'attended',
            },
        }
    }


    /**
     * Remove a track that is ended from remote.
     * @param {MediaStreamTrack} streamId - Id of the stream to clean up.
     */
    _cleanupStream(streamId) {
        const path = `caller.calls.${this.id}.streams.${streamId}`
        this.app.setState(null, {action: 'delete', path})
        delete this.app.media.streams[streamId]
    }


    /**
     * Add two video elements to the DOM of AppBackground and get the
     * permission to the microphone. This permission is already granted
     * from the fg script. Addding the video elements to the bg DOM
     * allows us to keep the Call stream active after the popup is closed.
     */
    async _initSinks() {
        // Set the output device from settings.
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


    /**
     * Handle UI and state for new incoming and outgoing calls.
     */
    _start() {
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
            settings: {webrtc: {media: {stream: {[streamType]: {selected: new Date().getTime()}}}}},
            ui: {menubar: {event: 'calling'}},
        })

        // Start the call timer.
        this.timerId = window.setInterval(() => {
            this.setState({timer: {current: new Date().getTime()}})
        }, 1000)
    }


    /**
     * Takes care of returning to a state before the call
     * was created. Make sure you set the final state of a call
     * before calling cleanup. The timeout is meant to postpone
     * resetting the state, so the user has a hint of what
     * happened in between. A silent call is dropped immediatly
     * however; since no UI-interaction is involved.
     * @param {Object} options - Options to pass to _stop.
     * @param {String} [options.message] - Force a notification message.
     * @param {Number} options.timeout - Postpone resetting the call state for the duration of 3 busy tones.
     */
    _stop({timeout = 1000} = {}) {
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
        let title = `${this.state.number}`
        if (this.state.name) title += ` - ${this.state.name}`

        const fromto = {
            incoming: this.app.$t('from'),
            outgoing: this.app.$t('to'),
        }

        // Make a Notification with relevant call information.
        const failCodes = ['callee_busy', 'callee_unavailable', 'caller_unavailable']
        if (failCodes.includes(this.state.status)) {
            title += ` (${this.app.$t(this.translations[this.state.status])})`
            message += this.app.$t('missed call {fromto} {name}', {
                fromto: fromto[this.state.direction],
                name: this.state.name ? this.state.name : this.state.number,
            }).ca()
            this.app.emit('caller:call-rejected', {call: this.state}, true)
        } else {
            title += ` (${this.timer().formatted})`
            message = this.app.$t('finished call {fromto} {name} after {time}', {
                fromto: fromto[this.state.direction],
                name: this.state.name ? this.state.name : this.state.number,
                time: this.timer().formatted,
            }).ca()

            this.app.emit('caller:call-ended', {call: this.state}, true)
        }

        this.app.modules.ui.notification({message, number: this.state.number, stack: true, title})

        // Remove the streams that are associated with this call.
        for (const streamId of Object.keys(this.streams)) {
            this.app.logger.debug(`${this}removing stream ${streamId}`)
            this._cleanupStream(streamId)
        }

        // Stop the Call interval timer.
        clearInterval(this.timerId)
        this.setState({keypad: {active: false}})
        // Reset the transfer state of target calls in case the transfer mode
        // of this Call is active and the callee ends the call.
        if (this.state.transfer.active) {
            this.app.modules.caller.transferState(this, false)
        }

        this.busyTone.stop()

        window.setTimeout(() => {
            this.app.modules.caller.deleteCall(this)
        }, timeout)
    }


    /**
     * Shared accept Call logic.
     */
    accept() {
        if (this.state.direction !== 'incoming') {
            throw 'session must be incoming type'
        }
    }


    addStream(stream, kind, visible = true) {
        const streamState = {
            id: stream.id,
            kind,
            local: false,
            muted: false,
            ready: false,
            visible,
        }

        this.app.media.streams[stream.id] = stream
        const path = `caller.calls.${this.id}.streams.${stream.id}`
        this.app.setState(streamState, {path})
    }


    /**
     * Generic UI and state-related logic for an outgoing call.
     * Note: first set the endpoint and name in the parent,
     * before calling this super.
     */
    incoming() {
        this.setState(this.state)
        if (this.silent) return

        const streamType = this.app.state.settings.webrtc.media.stream.type
        // Switch to the caller and activate the local stream.
        this.app.setState({
            settings: {webrtc: {media: {stream: {[streamType]: {selected: true}}}}},
            ui: {layer: 'caller', menubar: {event: 'ringing'}},
        })

        if (this.app.state.settings.webhooks.enabled) {
            const url = this.app.state.settings.webhooks.url
            window.open(url.replace('{number}', this.state.number), '_blank', 'alwaysLowered=yes')
        }

        this.app.modules.caller.activateCall(this, true)
        this.app.sounds.ringTone.play({loop: true})
    }


    /**
     * Some UI state plumbing to setup an outgoing Call.
     */
    outgoing() {
        // Try to fill in the name from contacts.
        const contacts = this.app.state.contacts.contacts
        let name = ''
        for (const id of Object.keys(contacts)) {
            if (contacts[id].endpoint === parseInt(this.number)) {
                name = contacts[id].name
            }
        }

        // Always set this call to be the active call.
        this.app.modules.caller.activateCall(this, true)
        this.setState({name: name, status: 'create'})
        this.app.setState({ui: {layer: 'caller', menubar: {event: 'ringing'}}})
    }


    /**
     * Call-specific setState that operates within the scope
     * of the Call's state.
     * @param {Object} state - The state to update.
     */
    setState(state) {
        // This merges to the call's local state; not the app's state!
        this.app._mergeDeep(this.state, state)
    }


    /**
     * Kick off the Call and get access to media
     * devices when it's not silent.
     */
    async start() {
        await this._initSinks()

        if (this.state.direction === 'incoming') this.incoming()
        else if (this.state.direction === 'outgoing') this.outgoing()
        else throw new Error(`invalid call direction: ${this.state.direction}`)
    }


    /**
    * Set the final call status on termination and
    * fire off the call closing ritual.
    * @param {String} status - Terminate with a set status.
    */
    terminate(status = null) {
        if (!status) {
            if (this.state.status === 'accepted') status = 'bye'
            else if (this.state.status === 'create') status = 'caller_unavailable'
            else if (this.state.status === 'invite') status = 'callee_busy'
        }
        this.setState({status})
        this._stop()
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


    /**
     * Generate a representational name for this module.
     * Used for logging.
     * @returns {String} - An identifier for this module.
     */
    toString() {
        return `${this.app}[call] [${this.id}] `
    }

}


module.exports = Call
