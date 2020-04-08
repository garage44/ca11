import Module from '../lib/module.js'

/**
* Main entrypoint for App.
* @memberof AppBackground.plugins
* @extends Plugin
*/
class ModuleApp extends Module {
    /**
    * @param {AppBackground} app - The background application.
    */
    constructor(app) {
        super(app)

        this._notifications = {}

        // Start responding to network changes.
        if (!app.env.isNode) {
            window.addEventListener('offline', () => {
                this.app.logger.info(`${this}switched to offline modus`)
                this.app.setState({app: {online: false}})
            })

            window.addEventListener('online', () => {
                const pollConnection = async() => {
                    const online = await this.checkConnectivity(1000)
                    if (!online) pollConnection()
                }
                pollConnection()
            })
        }
    }


    /**
    * Initializes the module's store.
    * @returns {Object} The module's store properties.
    */
    _initialState() {
        return {
            dnd: false,
            editMode: false,
            installed: true,
            name: 'CA11',
            notifications: [],
            online: true,
            search: {
                disabled: false,
                input: '',
            },
            session: {
                active: null,
                available: [],
            },
            updated: false,
            vault: {
                key: null,
                salt: null,
                store: true,
                unlocked: false,
            },
            vendor: {
                name: 'ca11',
                support: {
                    email: 'info@ca11.app',
                    phone: 'S11-CA11',
                    website: 'https://ca11.app',
                },
            },
            version: {
                current: '',
                previous: '',
            },
        }
    }


    /**
    * Restore stored dumped state from localStorage.
    * @param {Object} moduleStore - Root property for this module.
    */
    _restoreState(moduleStore) {
        moduleStore.notifications = []
        moduleStore.online = true
    }


    _watchers() {
        return {
            /**
            * Schedule removal of a newly add notification if it
            * has a timeout property.
            * @param {Array} notifications - A reference to the current content of notifications.
            */
            'store.app.notifications': (notifications) => {
                for (const notification of notifications) {
                    if (notification.timeout && !this._notifications[notification.id]) {
                        this._notifications[notification.id] = setTimeout(() => {
                            // Use the notification reference from state here,
                            // or this method will not behave consistently.
                            notifications = this.app.state.app.notifications.filter(i => i.id !== notification.id)
                            this.app.setState({app: {notifications}})
                            delete this._notifications[notification.id]
                        }, notification.timeout)
                    }
                }
            },
            'store.app.vault.store': (storeVaultKey) => {
                if (!this.app.state.session.authenticated) return

                if (storeVaultKey) {
                    this.app.crypto.storeVaultKey()
                } else {
                    this.app.logger.info(`${this}disabling auto session recovery`)
                    this.app.setState({app: {vault: {key: null}}}, {encrypt: false, persist: true})
                }
            },
        }
    }


    /**
    * The `online` event and `navigator.onLine` are not accurate,
    * because it only verifies network connectivity, and not
    * access to the internet. This additional check sees if
    * we can open a websocket to the defined endpoint.
    * Fallback to `navigator.onLine` if there is no endpoint
    * to check.
    * @param {Number} pause - Pauses resolving when polling is necessary.
    * @returns {Promise} - Resolves when the websocket opens or fails.
    */
    checkConnectivity(pause) {
        return new Promise((resolve) => {
            const endpoint = this.app.state.settings.webrtc.endpoint.uri
            if (endpoint) {
                this.app.logger.info(`${this}verifying online modus`)

                const checkSocket = new WebSocket(`wss://${endpoint}`, 'sip')
                checkSocket.onopen = () => {
                    this.app.logger.info(`${this}switched to online modus`)
                    this.app.setState({app: {online: true}})
                    checkSocket.close()
                    if (pause) setTimeout(() => resolve(true), pause)
                    else resolve(true)
                }

                checkSocket.onerror = () => {
                    this.app.setState({app: {online: false}})
                    if (pause) setTimeout(() => resolve(false), pause)
                    else resolve(false)
                }
            } else {
                this.app.setState({app: {online: navigator.onLine}})
                resolve(navigator.onLine)
            }
        })
    }


    /**
    * Generate a representational name for this module. Used for logging.
    * @returns {String} - An identifier for this module.
    */
    toString() {
        return `${this.app}[app] `
    }
}

export default ModuleApp
