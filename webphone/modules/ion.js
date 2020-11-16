import Call from '../lib/call.js'
import ClientIon from '@ca11/ion/client.js'
import Module from '../lib/module.js'


class ModuleION extends Module {

    constructor(app) {
        super(app)

        this.app.on('ca11:services', () => {
            const enabled = this.app.state.ion.enabled
            app.logger.debug(`ion ${enabled ? 'enabled' : 'disabled'}`)
            if (enabled) this.connect()
        })

        this.app.on('sig11:services', () => {
            this.connect()
        })

    }


    async connect() {
        if (['connected', 'registered'].includes(this.app.state.ion.status)) {
            this.disconnect()
            return
        }

        // The default is to reconnect.
        this.reconnect = true

        console.log("STATE", this.app.state.ion.domain)

        this.client = new ClientIon({
            domain: this.app.state.ion.domain,
            logger: this.app.logger,
            stun: this.app.state.settings.webrtc.stun,
        })

        this.app.clients.ion = this.client

        this.client.on('registered', this.onRegistered.bind(this))
        this.client.on('registrationFailed', this.onRegistrationFailed.bind(this))
        this.client.on('transportCreated', () => {
            this.ua.transport.on('connected', this.onConnected.bind(this))
            this.ua.transport.on('disconnected', this.onDisconnected.bind(this))
        })
        this.client.on('unregistered', this.onUnregistered.bind(this))

        this.client.on('invite', this.onInvite.bind(this))
        this.client.on('terminate', ({callId}) => {
            console.log("TERMINATE CALL", callId)
            this.app.modules.caller.calls[callId].terminate()
        })

        this.client.on('sip:dtmf', ({callId, key}) => {
            this.app.modules.caller.calls[callId].session.dtmf(key)
        })

        this.client.emit('sip:ua')

        this.client.connect()
    }


    disconnect(reconnect = true) {
        this.app.logger.info(`ua disconnect (reconnect: ${reconnect ? 'yes' : 'no'})`)
        this.reconnect = reconnect
        this.app.setState({sip: {status: reconnect ? 'loading' : null}})
        this.ua.unregister()
        this.ua.transport.disconnect()
        this.ua.transport.disposeWs()
        if (reconnect) {
            this.connect()
        }
    }


    onConnected() {
        this.app.logger.debug(`ua connected`)
        // Reset the retry interval timer..
        this.retry = Object.assign({}, this.retryDefault)
    }


    onDisconnected() {
        this.app.logger.debug(`ua disconnected`)
        this.app.setState({sip: {status: 'disconnected'}})

        this.retry = Object.assign({}, this.retryDefault)
        this.reconnect = false

        if (this.reconnect) {
            // Reconnection timer logic is performed only here.
            this.app.logger.debug(`reconnect in ${this.retry.timeout} ms`)
            setTimeout(() => {
                this.connect({register: this.app.state.settings.webrtc.enabled})
            }, this.retry.timeout)
            this.retry = this.app.timer.increaseTimeout(this.retry)
        }
    }


    onInvite({handler, context}) {
        this.app.logger.debug(`<event:invite>`)

        const deviceReady = this.app.state.settings.webrtc.devices.ready
        const dnd = this.app.state.app.dnd
        const microphoneAccess = this.app.state.settings.webrtc.media.permission

        let acceptCall = true

        if (dnd || !microphoneAccess || !deviceReady) {
            acceptCall = false
            handler.terminate()
        }

        if (!acceptCall) return

        const description = {
            direction: 'incoming',
            handler,
            protocol: 'sip',
        }

        const call = new Call(this.app, description, {silent: !acceptCall})
        call.initSinks()
        call.initIncoming({context, handler })

        this.app.Vue.set(this.app.state.caller.calls, call.id, call.state)
        this.app.modules.caller.calls[call.id] = call
        this.app.logger.info(`incoming call ${call.id} allowed by invite`)
    }


    onRegistered() {
        this.app.logger.info(`registered at ${this.client.endpoint}`)
        if (this.__registerPromise) {
            this.__registerPromise.resolve()
            delete this.__registerPromise
        }
        this.app.setState({sip: {status: 'registered'}})
        this.app.emit('core:sip:registered', {}, true)
    }


    onRegistrationFailed() {
        this.app.logger.debug(`ua registrationFailed`)
        if (this.__registerPromise) {
            this.__registerPromise.reject()
            this.disconnect()
            delete this.__registerPromise
        }
        this.app.setState({sip: {status: 'registration_failed'}})
    }


    onUnregistered() {
        this.app.logger.debug(`ua unregistered>`)
        this.app.setState({sip: {status: this.ua.transport.isConnected() ? 'connected' : 'disconnected'}})
    }


    state() {
        return {
            init: {
                domain: globalThis.env.domains.ion,
                enabled: true,
                status: 'loading',
            },
        }
    }


    vmWatchers() {
        return {
            /**
            * Respond to network changes.
            * @param {Boolean} online - Whether we are online now.
            */
            'store.app.online': (online) => {
                if (online) {
                    // We are online again, try to reconnect and refresh API data.
                    this.app.logger.debug(`reconnect sip service (online modus)`)
                    this.connect()
                } else {
                    // Offline modus is not detected by Websocket; disconnect manually.
                    this.app.logger.debug(`disconnect sip service (offline modus)`)
                    this.disconnect(false)
                }
            },
        }
    }





























}

export default ModuleION
