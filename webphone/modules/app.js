import Module from '../lib/module.js'

class ModuleApp extends Module {

    constructor(app) {
        super(app)

        this._notifications = {}

        // Start responding to network changes.
        if (!app.env.isNode) {
            window.addEventListener('offline', () => {
                this.app.logger.info(`switched to offline modus`)
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
                this.app.logger.info(`verifying online modus`)

                const checkSocket = new WebSocket(`wss://${endpoint}`, 'sip')
                checkSocket.onopen = () => {
                    this.app.logger.info(`switched to online modus`)
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


    state() {
        return {
            init: {
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
            },
            restore: {
                notifications: [],
                online: true,
            },
        }
    }


    vmWatchers() {
        return {
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
                    this.app.logger.info(`disabling auto session recovery`)
                    this.app.setState({app: {vault: {key: null}}}, {encrypt: false, persist: true})
                }
            },
        }
    }
}

export default ModuleApp
