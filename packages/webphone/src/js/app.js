import Crypto from '@ca11/sig11/src/crypto'

import App from './lib/app'
import Devices from './lib/devices'
import StateStore from './lib/store'
import Media from './lib/media'
import Session from './lib/session'
import Sounds from './lib/sounds'

global.Module = require('./lib/module')


/**
* The CA11 namespace is the base of the CA11 application.
* @namespace CA11
*/
class CA11 extends App {
    /**
    * @param {Object} opts - Options to initialize AppBackground with.
    * @param {Object} opts.env - The environment sniffer.
    * @param {Object} opts.plugins - Plugins to load.
    * @namespace CA11.plugins
    */
    constructor(opts) {
        super(opts)
        // Allow context debugging during development.
        // Avoid leaking this global in production mode.
        if (!(process.env.NODE_ENV === 'production')) global.ca11 = this

        this.session = new Session(this)
        this.stateStore = new StateStore(this)
        this.crypto = new Crypto(this)

        this._writeState = []
        this._vueWatchers = []

        if (this.env.isBrowser) {
            this.components = {
                About: require('../components/about'),
                Activities: require('../components/activities'),
                AudioBg: require('../components/audio-bg'),
                Call: require('../components/call'),
                Caller: require('../components/caller'),
                Contacts: require('../components/contacts'),
                Devices: require('../components/devices'),
                Dnd: require('../components/dnd'),
                Field: require('../components/field'),
                Main: require('../components/main'),
                MenuCommunicate: require('../components/menu-communicate'),
                MenuContext: require('../components/menu-context'),
                Network: require('../components/network'),
                Notifications: require('../components/notifications'),
                ProtocolStatus: require('../components/protocol-status'),
                Session: require('../components/session'),
                Settings: require('../components/settings'),
                Soundmeter: require('../components/soundmeter'),
                Stream: require('../components/stream'),
                StreamView: require('../components/stream-view'),
            }

            for (const name of Object.keys(this.components)) {
                Vue.component(name, this.components[name](this))
            }
        }

        this.modules = {}

        this._loadModules(this.__modules)

        this.media = new Media(this)
        this.sounds = new Sounds(this)

        this._initStore()
    }


    /**
    * Load store defaults and restore the encrypted state from
    * localStorage, if the session can be restored immediately.
    * Load a clean state from defaults otherwise. Then initialize
    * the ViewModel and check for the data schema. Do a factory reset
    * if the data schema is outdated.
    */
    async _initStore() {
        super._initStore()
        await this.session.change('active')
        // The vault always starts in a locked position.
        this.setState({
            app: {vault: {unlocked: false}},
            ui: {menubar: {base: 'inactive', event: null}},
        })

        let main = null
        // eslint-disable-next-line new-cap
        if (this.env.isBrowser) main = this.components.Main(this)

        if (!this.state.app.vault.key) {
            // No session yet.
            this._initViewModel({main})
        } else {
            await this.session.open({key: this.state.app.vault.key})
            // (!) State is reactive after initializing the viewmodel.
            this._initViewModel({main})
            this._setVueWatchers()
        }

        this.devices = new Devices(this)

        // Signal all plugins that CA11 is ready to go.
        for (let module of Object.keys(this.modules)) {
            if (this.modules[module]._ready) this.modules[module]._ready()
        }

        if (this.state.session.authenticated) {
            this.media.query()
            this.emit('ca11:services')
        }

        // Schema validation allows CA11 to be reset when
        // the internal state structure between versions
        // changed. Needs to be replaced by migrations at
        // some point.
        let notification = {message: null, title: null}
        // Only send a notification when the schema is already defined and invalid.
        if (this.stateStore.valid()) {
            this.emit('ready')
        } else {
            notification.message = this.$t('this update requires you to re-login and setup your account again; our apologies.')
            notification.title = this.$t('database schema changed')
            this.modules.ui.notification(notification)
            this.stateStore.clear()
            this.emit('factory-defaults')
            if (this.env.isBrowser) location.reload()
        }
    }


    /**
    * This operation applies the state update and processes unencrypted
    * writes immediately; these can be done synchronously. Encrypted store
    * writes are deferred to a write queue.
    * @param {Object} options - See the parameter description of super.
    * @returns {null|Promise} - Encrypt operation returns a Promise.
    */
    async _mergeState({action = 'upsert', encrypt = true, path = null, persist = false, state}) {
        const storeEndpoint = this.state.app.session.active
        // This could happen when an action is still queued, while the user
        // is logging out at the same moment. The action is then ignored.
        if (persist && !storeEndpoint) return null

        // Apply the state change to the active store.
        super._mergeState({action, encrypt, path, persist, state})
        if (!persist) return null

        // Apply the changes to the cached store.
        let storeState
        if (!encrypt) storeState = this.stateStore.cache.unencrypted
        else storeState = this.stateStore.cache.encrypted

        super._mergeState({action, encrypt, path, persist, source: storeState, state})

        // Write synchronously unencrypted data to LocalStorage.
        if (!encrypt) {
            this.stateStore.set(`${storeEndpoint}/state`, storeState)
            return null
        }

        // Data is first encrypted async; then written to LocalStorage.
        // First make a snapshot and sent the write action to the queue.
        // All async write actions must be processed in order.
        return new Promise((resolve, reject) => {
            this._writeState.push({
                action: (item) => this._writeEncryptedState({
                    item, reject, resolve, state: this.utils.copyObject(storeState),
                }),
                status: 0,
            })

            this._processWriteQueue()
        })
    }


    _processWriteQueue() {
        if (this._writeState.length) {
            // Only fire an action once per call.
            let actionStarted = false
            for (const item of this._writeState) {
                if (item.status === 0 && !actionStarted) {
                    actionStarted = true
                    item.action(item)
                } else if (this._writeState[0].status === 2) {
                    this._writeState.shift()
                }
            }
        }
    }


    /**
    * The stored state is separated between two serialized JSON objects
    * in localStorage. One is for encrypted data, and the other for
    * unencrypted data. When the application needs to retrieve its state
    * from storage, this method will restore the combined state
    * and applies module-specific state changes. See for instance the
    * _restoreState implementation in the Contacts module for a more
    * complicated example.
    */
    async _restoreState() {
        const sessionId = this.state.app.session.active

        let unencryptedState = this.stateStore.get(`${sessionId}/state`)
        if (!unencryptedState) {
            throw new Error(`${this}state store for session not found: '${sessionId}'`)
        }

        this.stateStore.cache.unencrypted = unencryptedState

        // Determine if there is an encrypted state vault.
        let cipherData = this.stateStore.get(`${sessionId}/state/vault`)
        let decryptedState = {}
        if (cipherData) {
            try {
                decryptedState = JSON.parse(await this.crypto.decrypt(this.crypto.vaultKey, cipherData))
            } catch (err) {
                this.logger.debug(`${this}failed to restore encrypted state`)
                throw new Error('failed to decrypt; wrong password?')
            }

            this.logger.debug(`${this}session vault decrypted`)
        } else decryptedState = {}
        this.stateStore.cache.encrypted = decryptedState

        let state = {}
        this._mergeDeep(state, decryptedState, unencryptedState)

        for (let module of Object.keys(this.modules)) {
            if (this.modules[module]._restoreState) {
                // Nothing persistent in this module yet. Assume an empty
                // object to start with.
                if (!state[module]) state[module] = {}
                this.modules[module]._restoreState(state[module])
            }
        }
        this.logger.debug(`${this}load previous state from session "${sessionId}"`)
        await this.setState(state)
    }


    _setVueWatchers() {
        this.logger.info(`${this}set vue watchers`)
        let watchers = this._watchers()

        for (let plugin of Object.values(this.modules)) {
            if (plugin._watchers) Object.assign(watchers, plugin._watchers())
        }

        for (const key of Object.keys(watchers)) {
            this._vueWatchers.push(this.vm.$watch(key, watchers[key]))
        }
    }


    _unsetVueWatchers() {
        this.logger.info(`${this}unset ${this._vueWatchers.length} vue watchers`)
        for (const unwatch of this._vueWatchers) unwatch()
        this._vueWatchers = []
    }


    /**
    * Store properties that are being watched.
    * @returns {Object} - Watched store properties.
    */
    _watchers() {
        return {
            'store.language.selected.id': (languageId) => {
                this.logger.info(`${this} setting language to ${languageId}`)
                Vue.i18n.set(languageId)
            },
        }
    }


    /**
    * A self-contained state write method that can be
    * parked in the queue, without affecting the ongoing
    * state.
    * @param {Object} options - The options to pass.
    */
    async _writeEncryptedState({item, reject, resolve, state}) {
        item.status = 1
        const storeEndpoint = this.state.app.session.active
        if (!storeEndpoint) return

        let storeState = await this.crypto.encrypt(
            this.crypto.vaultKey,
            JSON.stringify(this.stateStore.cache.encrypted),
        )
        this.stateStore.set(`${storeEndpoint}/state/vault`, storeState)
        item.status = 2
        // Process the next queue item in case other
        // write actions were added in the meantime.
        resolve()
        this._processWriteQueue()
    }


    /**
    * Set the state within the own running script context
    * and then propagate the state to the other logical
    * endpoint for syncing.
    * @param {Object} state - The state to update.
    * @param {Boolean} options - Whether to persist the changed state to localStorage.
    */
    async setState(state, {action, encrypt, path, persist = false} = {}) {
        if (!action) action = 'upsert'
        // Merge state in the context of the executing script.
        await this._mergeState({action, encrypt, path, persist, state})
    }


    /**
    * Generate a representational name for this module. Used for logging.
    * @returns {String} - An identifier for this module.
    */
    toString() {
        return '[ca11] '
    }
}


const options = require('./lib/options')
if (options.env.isBrowser) {
    this.ca11 = new CA11(options)
} else {
    // Help modules find the ca11 module alias from package.json
    module.exports = {CA11, options}
}
