import SIPCall from './call.js'


/**
 * Manage SIG11 calls.
 * @module SIPCaller
 */
class SIPCaller {

    constructor(app, plugin) {
        this.app = app
        this.plugin = plugin

        // Handle incoming calls.
        this.app.on('sip:ua', () => {
            this.app.sip.ua.on('invite', this.onInvite.bind(this))
        })


        this.app.on('sip:dtmf', ({callId, key}) => {
            this.app.modules.caller.calls[callId].session.dtmf(key)
        })
    }


    call(description) {
        return new SIPCall(this.app, description)
    }


    /**
     * Event handler for an incoming SIP call, known as an 'invite'.
     * @param {Session} session - The SIP.js session.
     */
    onInvite(session) {
        this.app.logger.debug(`${this}<event:invite>`)

        const deviceReady = this.app.state.settings.webrtc.devices.ready
        const dnd = this.app.state.app.dnd
        const microphoneAccess = this.app.state.settings.webrtc.media.permission

        let acceptCall = true

        if (dnd || !microphoneAccess || !deviceReady) {
            acceptCall = false
            session.terminate()
        }

        if (Object.keys(this.plugin.calls).length) {
            acceptCall = false
            session.terminate({
                reasonPhrase: 'call waiting is not supported',
                statusCode: 486,
            })
        }

        if (!acceptCall) return

        const description = {
            protocol: 'sip',
            session,
        }

        const call = new SIPCall(this.app, description, {silent: !acceptCall})
        call.start()
        Vue.set(this.app.state.caller.calls, call.id, call.state)
        this.app.modules.caller.calls[call.id] = call
        this.app.logger.info(`${this}incoming call ${call.id} allowed by invite`)
    }


    /**
     * Generate a representational name for this module. Used for logging.
     * @returns {String} - An identifier for this module.
     */
    toString() {
        return `${this.app}[caller][sip] `
    }

}

export default SIPCaller
