
import Module from '../lib/module.js'
// import SIPCall from './call/sip.js'
import SipClient from '@ca11/sip/client.js'


class ModuleSIP extends Module {

    constructor(app) {
        super(app)

        this.app.on('ca11:services', () => {
            const enabled = this.app.state.sip.enabled
            app.logger.debug(`${this}sip ${enabled ? 'enabled' : 'disabled'}`)
            if (enabled) this.connect()
        })

        this.app.on('sig11:services', (services) => {
            this.app.setState({
                sip: {
                    account: services.sip.account,
                    enabled: true,
                    toggled: true,
                },
            }, {persist: true})
            this.connect()
        })

    }


    _initialState() {
        return {
            account: {
                password: null,
                username: null,
            },
            enabled: false,
            endpoint: globalThis.env.endpoints.sip,
            status: 'loading',
            toggled: false,
        }
    }


    _watchers() {
        return {
            /**
            * Respond to network changes.
            * @param {Boolean} online - Whether we are online now.
            */
            'store.app.online': (online) => {
                if (online) {
                    // We are online again, try to reconnect and refresh API data.
                    this.app.logger.debug(`${this}reconnect sip service (online modus)`)
                    this.connect()
                } else {
                    // Offline modus is not detected by Sip.js/Websocket.
                    // Disconnect manually.
                    this.app.logger.debug(`${this}disconnect sip service (offline modus)`)
                    this.disconnect(false)
                }
            },
        }
    }


    call(description) {
        return new SIPCall(this.app, description)
    }


    async connect() {
        if (['connected', 'registered'].includes(this.app.state.sip.status)) {
            this.disconnect()
            return
        }

        // The default is to reconnect.
        this.reconnect = true
        const username = this.app.state.sip.account.username


        this.client = new SipClient({
            endpoint: this.app.state.sip.endpoint,
            logger: this.app.logger,
            password: this.app.state.sip.account.password,
            stun: this.app.state.settings.webrtc.stun,
            user: username,
        })

        this.client.on('registered', this.onRegistered.bind(this))
        this.client.on('registrationFailed', this.onRegistrationFailed.bind(this))
        this.client.on('transportCreated', () => {
            this.ua.transport.on('connected', this.onConnected.bind(this))
            this.ua.transport.on('disconnected', this.onDisconnected.bind(this))
        })
        this.client.on('unregistered', this.onUnregistered.bind(this))

        this.client.on('message', function(message) {
            console.log("MESSAGE", message.body)
        })

        this.client.on('invite', this.onInvite.bind(this))

        this.client.on('sip:dtmf', ({callId, key}) => {
            this.app.modules.caller.calls[callId].session.dtmf(key)
        })

        this.client.emit('sip:ua')

        this.client.connect()
    }


    /**
     * Graceful stop, do not reconnect automatically.
     * @param {Boolean} reconnect - Whether try to reconnect.
     */
    disconnect(reconnect = true) {
        this.app.logger.info(`${this}ua disconnect (reconnect: ${reconnect ? 'yes' : 'no'})`)
        this.reconnect = reconnect
        this.retry.timeout = 0

        this.app.setState({sip: {status: reconnect ? 'loading' : null}})
        this.ua.unregister()
        this.ua.transport.disconnect()
        this.ua.transport.disposeWs()
        if (reconnect) {
            this.connect()
        }
    }


    onConnected() {
        this.app.logger.debug(`${this}ua connected`)
        // Reset the retry interval timer..
        this.retry = Object.assign({}, this.retryDefault)
    }


    onDisconnected() {
        this.app.logger.debug(`${this}ua disconnected`)
        this.app.setState({sip: {status: 'disconnected'}})

        this.retry = Object.assign({}, this.retryDefault)
        this.reconnect = false
        // Don't use SIPJS reconnect logic, because it doesn't deal
        // with offline detection and incremental retry timeouts.
        if (this.reconnect) {
            // Reconnection timer logic is performed only here.
            this.app.logger.debug(`${this}reconnect in ${this.retry.timeout} ms`)
            setTimeout(() => {
                this.connect({register: this.app.state.settings.webrtc.enabled})
            }, this.retry.timeout)
            this.retry = this.app.timer.increaseTimeout(this.retry)
        }
    }


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
        this.app.Vue.set(this.app.state.caller.calls, call.id, call.state)
        this.app.modules.caller.calls[call.id] = call
        this.app.logger.info(`${this}incoming call ${call.id} allowed by invite`)
    }


    onRegistered() {
        this.app.logger.info(`${this}registered at ${this.client.endpoint}`)
        if (this.__registerPromise) {
            this.__registerPromise.resolve()
            delete this.__registerPromise
        }
        this.app.setState({sip: {status: 'registered'}})
        this.app.emit('core:sip:registered', {}, true)
    }


    onRegistrationFailed() {
        this.app.logger.debug(`${this}ua registrationFailed`)
        if (this.__registerPromise) {
            this.__registerPromise.reject()
            this.disconnect()
            delete this.__registerPromise
        }
        this.app.setState({sip: {status: 'registration_failed'}})
    }


    onUnregistered() {
        this.app.logger.debug(`${this}ua unregistered>`)
        this.app.setState({sip: {status: this.ua.transport.isConnected() ? 'connected' : 'disconnected'}})
    }


    toString() {
        return `${this.app}[mod-sip] `
    }


    /**
     * Build the useragent to identify CA11 with.
     * The format is `CA11/<VERSION> (<OS/<ENV>) <Vendor>`.
     * Don't change this string lightly since third-party
     * applications depend on it.
     * @returns {String} - Useragent string.
     */
    userAgent() {
        const env = this.app.env
        let userAgent = 'CA11/' + globalThis.env.VERSION + ' '
        if (env.isLinux) userAgent += '(Linux/'
        else if (env.isMacOS) userAgent += '(MacOS/'
        else if (env.isWindows) userAgent += '(Windows/'

        if (env.isChrome) userAgent += 'Chrome'
        if (env.isElectron) userAgent += 'Electron'
        else if (env.isFirefox) userAgent += 'Firefox'

        userAgent += `) ${this.app.state.app.vendor.name}`
        return userAgent
    }

}

export default ModuleSIP
