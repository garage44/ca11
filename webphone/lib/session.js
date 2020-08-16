import { mergeDeep } from '/webphone/lib/utils.js'
import { restoreState } from '/webphone/lib/state.js'

class Session {

    constructor(app) {
        this.app = app
        this._vmWatchers = []
    }


    /**
    * Reboot a session with a clean state. It can be used
    * to load a specific previously stored session, or to
    * continue the session that should be active or to
    * start a `new` session.
    * @param {String} sessionId - The identifier of the session.
    * @param {Object} keptState - State that needs to survive.
    * @returns {String} - The session id that is going to be used.
    */
    async change(sessionId, keptState = {}, {logout = false} = {}) {
        // The store cache must be emptied when switching sessions,
        // otherwise unwanted state will leak into other sessions.
        this.app.stateStore.cache.encrypted = {}
        // Find sessions from LocalStorage.
        const sessionInfo = this.locate()

        if (sessionId === 'active') {
            sessionId = sessionInfo.active ? sessionInfo.active : null
        }

        if (logout) {
            this.app.setState({
                app: {vault: {key: null, unlocked: false}},
                session: {authenticated: false},
            }, {encrypt: false, persist: true})
            this.app.stateStore.cache.unencrypted = {}
        }

        this.app.logger.debug(`switch to session "${sessionId}"`)
        // Disable all watchers while switching sessions.
        if (this._vmWatchers.length) this.unsetVmWatchers()

        // Overwrite the current state with the initial state.
        const newState = this.initState()
        mergeDeep(this.app.state, mergeDeep(newState, keptState))

        sessionInfo.active = sessionId
        this.app.setState({app: {session: sessionInfo}})

        // Copy the unencrypted store of an active session to the state.
        if (sessionId && sessionId !== 'new') {
            mergeDeep(this.app.state, this.app.stateStore.get(`${sessionId}/state`))
            // Always pin these presets, no matter what the stored setting is.
            if (this.app.state.app.vault.key) {
                this.app.state.app.vault.unlocked = true
            } else {
                this.app.state.app.vault.unlocked = false
            }

            Object.assign(this.app.state.session, {authenticated: false, username: sessionId})
        }

        // Set the info of the current sessions in the store again.
        await this.app.setState(this.app.state)

        return sessionId
    }


    async close() {
        this.app.logger.info(`logging out and cleaning up state`)
        this.unsetVmWatchers()
        await this.change(null, {}, {logout: true})

        this.app.media.stop()
        this.app.setLanguage()
    }


    async destroy(sessionId) {
        this.app.logger.info(`removing session "${sessionId}"`)
        this.app.stateStore.remove(`${sessionId}/state`)
        this.app.stateStore.remove(`${sessionId}/state/vault`)
        await this.change(null)
    }


    initState() {
        let state = this.state().init
        for (let name of Object.keys(this.app.modules)) {
            if (this.app.modules[name].state) {
                state[name] = this.app.modules[name].state().init
            }
        }

        return state
    }


    initVmWatchers() {
        this.app.logger.info(`set vue watchers`)
        let watchers = this.vmWatchers()

        for (let plugin of Object.values(this.app.modules)) {
            if (plugin.vmWatchers) Object.assign(watchers, plugin.vmWatchers())
        }

        for (const key of Object.keys(watchers)) {
            this._vmWatchers.push(this.app.vm.$watch(key, watchers[key]))
        }
    }


    /**
    * This method returns all available sessions and the
    * preferred one. The `active = null` means
    * that no session is selected.
    * @returns {Object} - The store sessions.
    */
    locate() {
        let active = null
        let available = []
        for (const key of Object.keys(this.app.stateStore.store)) {
            if (key.endsWith('state')) {
                const sessionName = key.replace('/state', '')
                available.push(sessionName)
                let state = JSON.parse(this.app.stateStore.store.getItem(key))
                // An active session has a stored key.
                if (state.app.vault.salt && state.app.vault.key) {
                    active = sessionName
                }
            }
        }

        return {active, available}
    }


    /**
    * Setup a store for a new or previously stored session.
    * @param {Object} [options] - options.
    * @param {String} [options.key] - Base64 PBKDF2 key to unlock session with.
    * @param {String} [options.password] - Password to encrypt the store with.
    */
    async open({key = null, password = null} = {}) {
        if (key) {
            this.app.logger.info(`open session vault`)
            await this.app.crypto.importVaultKey(key)
        } else if (password) {
            const sessionId = this.app.state.app.session.active
            this.app.logger.debug(`new session vault: ${sessionId}`)
            await this.app.crypto.createVaultKey(sessionId, password)
        } else {
            throw new Error('failed to unlock (no session key or credentials)')
        }

        const state = await restoreState(this.app)
        await this.app.setState(state)

        this.app.setState({
            app: {vault: {unlocked: true}},
            session: {authenticated: true},
        }, {encrypt: false, persist: true})

        if (key) this.app.emit('session:imported')
        else if (password) this.app.emit('session:created')

        // Set the default layer if it's still set to login.
        if (this.app.state.ui.layer === 'login') {
            this.app.setState({ui: {layer: 'dialer'}}, {encrypt: false, persist: true})
        }

        // Make sure the vault key is stored when it is supposed to.
        const vault = this.app.state.app.vault
        if (vault.store && !vault.key) {
            await this.app.crypto.storeVaultKey()
        }
    }


    /**
    * Some default actions that are done, no matter
    * what login provider is being used.
    * @param {Object} options - Options to pass.
    * @param {String} options.password - The password that is used to unlock a session.
    * @param {String} options.username - The username the user is identified with.
    */
    async start({password, username}) {
        this.app.sounds.powerOn.play()
        this.app.setState({session: {status: 'login'}})
        let sessionName = username
        username = username.split('@')[0]

        if (this.app.state.app.session.active !== sessionName) {
            // State is reinitialized, but we are not done loading yet.
            let keptState = {
                session: {status: 'login'},
                sig11: {
                    identity: {
                        name: username,
                        number: username,
                    },
                },
            }
            await this.change(sessionName, keptState)
        }

        try {
            await this.open({password})
            this.initVmWatchers()

            this.app.setState({
                // The `installed` and `updated` flag are toggled off after login.
                app: {installed: false, updated: false},
                session: {username},
                ui: {layer: 'dialer'},
            }, {encrypt: false, persist: true})

            await this.app.setState({
                session: {
                    id: shortid(),
                },
                sig11: {
                    identity: {
                        name: username,
                        number: username,
                    },
                },
            }, {persist: true})
            this.app.setLanguage()

        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err)
            this.app.notify({icon: 'warning', message: this.app.$t('failed to login; please check your credentials.'), type: 'warning'})
        } finally {
            this.app.media.query()
            this.app.setState({session: {status: null}})
            this.app.emit('ca11:services')
        }
    }


    state() {
        return {
            init: {
                session: {
                    authenticated: false,
                    developer: false,
                    status: null,
                    username: null,
                },
            },
        }
    }


    async unlock({username, password}) {
        this.app.logger.info(`unlocking session "${username}"`)
        this.app.sounds.powerOn.play()
        this.app.setState({session: {status: 'unlock'}})

        try {
            await this.open({password})
            this.initVmWatchers()
            this.app.setLanguage()
            this.app.setState({ui: {layer: 'dialer'}}, {encrypt: false, persist: true})
            this.app.emit('ca11:services')
        } catch (err) {
            // Wrong password, resulting in a failure to decrypt.
            this.app.setState({
                session: {authenticated: false},
                ui: {layer: 'session'},
            }, {encrypt: false, persist: true})
            const message = this.app.$t('failed to unlock; check your password')
            this.app.notify({icon: 'warning', message, type: 'danger'})
        } finally {
            this.app.media.query()
            this.app.setState({session: {status: null}})
        }
    }


    unsetVmWatchers() {
        this.app.logger.info(`unset ${this._vmWatchers.length} vue watchers`)
        for (const unwatch of this._vmWatchers) unwatch()
        this._vmWatchers = []
    }


    vmWatchers() {
        return {
            'store.language.selected.id': (languageId) => {
                this.app.logger.info(`setting language to ${languageId}`)
                this.app.Vue.i18n.set(languageId)
            },
        }
    }
}

export default Session
