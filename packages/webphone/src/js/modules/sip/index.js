
import SessionDescriptionHandler from './sdh'

/**
* SIP Network logic for CA11 clients.
* @module ModuleUI
*/
class ModuleSIP extends Module {

    constructor(app) {
        super(app)
        app.sip = this

        this.app.on('ca11:services', () => {
            const enabled = this.app.state.sip.enabled
            app.logger.info(`${this}sip ${enabled ? 'enabled' : 'disabled'}`)
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
            endpoint: process.env.SIP_ENDPOINT,
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


    /**
     * Connect to the configured SIP backend; e.g. Asterisk 16.
     */
    async connect() {
        if (['connected', 'registered'].includes(this.app.state.sip.status)) {
            this.disconnect()
            return
        }

        // The default is to reconnect.
        this.reconnect = true
        const username = this.app.state.sip.account.username
        // Overwrite the existing instance with a new one every time.
        // SIP.js doesn't handle resetting configuration well.
        let wsServers = this.app.state.sip.endpoint
        if (!wsServers.includes('ws://') && !wsServers.includes('wss://')) {
            wsServers = `wss://${wsServers}`
        }

        this.ua = new SIP.UA({
            authorizationUser: username,
            autostart: false,
            autostop: false,
            log: {
                builtinEnabled: true,
                level: 'error',
            },
            // Incoming unanswered calls are terminated after x seconds.
            noanswertimeout: 60,
            password: this.app.state.sip.account.password,
            register: true,
            sessionDescriptionHandlerFactory: (session, options) => {
                options.app = this.app
                return SessionDescriptionHandler.defaultFactory(session, options)
            },
            sessionDescriptionHandlerFactoryOptions: {
                constraints: this.app.media._getUserMediaFlags(),
                peerConnectionOptions: {
                    rtcConfiguration: {
                        iceServers: this.app.state.settings.webrtc.stun.map((i) => ({urls: i})),
                        // Chrome's unified-plan doesn't work with Asterisk yet;
                        // instead plan-b with sdp-interop-sl is used.
                        sdpSemantics: 'plan-b',
                    },
                },
            },
            traceSip: false,
            transportOptions: {
                // Reconnects are handled manually.
                maxReconnectionAttempts: 0,
                wsServers: wsServers,
            },
            uri: `${username}@${this.app.state.sip.endpoint.split('/')[0]}`,
            userAgentString: this.userAgent(),
        })

        // Bind all events.

        this.ua.on('registered', this.onRegistered.bind(this))
        this.ua.on('registrationFailed', this.onRegistrationFailed.bind(this))
        this.ua.on('transportCreated', () => {
            this.ua.transport.on('connected', this.onConnected.bind(this))
            this.ua.transport.on('disconnected', this.onDisconnected.bind(this))
        })
        this.ua.on('unregistered', this.onUnregistered.bind(this))
        this.app.emit('sip:ua')

        this.ua.start()
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


    onRegistered() {
        this.app.logger.debug(`${this}ua registered`)
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


    /**
    * Generate a representational name for this module. Used for logging.
    * @returns {String} - An identifier for this module.
    */
    toString() {
        return `${this.app}[sip] `
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
        // Don't use template literals, because envify
        // can't deal with string replacement.
        let userAgent = 'CA11/' + process.env.VERSION + ' '
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
