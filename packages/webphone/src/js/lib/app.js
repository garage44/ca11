import Skeleton from '@ca11/boilerplate'


/**
* The App class extends from the `Skeleton` class and adds
* optional modules, viewmodel and state handling and
* translations.
* @extends Skeleton
*/
class App extends Skeleton {

    constructor(settings) {
        super(settings)

        this.i18n = new I18nTranslations(this, settings.plugins)

        this.$t = (text) => text
        this.filters = require('./filters')(this)
        this.helpers = require('./helpers')(this)

        // Copied to the initial state object.
        this._state = {}

        this.__modules = settings.modules
    }


    /**
    * Get an object reference from a keypath.
    * @param {Object} obj - The object to find the reference in.
    * @param {Array} keypath - The keypath to search.
    * @returns {*|undefined} - The reference when found, undefined otherwise.
    */
    __getKeyPath(obj, keypath) {
        if (keypath.length === 1) {
            // Arrived at the end of the keypath. Check if the property exists.
            if (!obj || !obj.hasOwnProperty(keypath[0])) return undefined
            return obj[keypath[0]]
        } else {
            if (!obj) return undefined
            return this.__getKeyPath(obj[keypath[0]], keypath.slice(1))
        }
    }


    /**
    * Initializes each module's store and combines the result
    * in a global state object, which is converted to
    * reactive getters/setters by Vue-stash.
    * @returns {Object} The module's store properties.
    */
    _initialState() {
        let state = this.utils.copyObject(this._state)
        for (let name of Object.keys(this.modules)) {
            if (this.modules[name]._initialState) {
                state[name] = this.modules[name]._initialState()
            }
        }

        return state
    }



    /**
    * Application parts using this class should provide their own
    * initStore implementation. The foreground script for instance
    * gets its state from the background, while the background
    * gets its state from localstorage or from a
    * hardcoded default fallback.
    * @param {Object} initialState - Extra state to begin with.
    */
    _initStore(initialState = {}) {
        /**
        * The state is a reactive store that is used to respond
        * to changes in data. The UI totally depends on the store
        * to render the appropriate views, but also data responds
        * to changes with the use of watchers.
        * @memberof App
        */
        this.state = Object.assign({
            env: this.env,
            language: {
                options: [
                    {id: 'en', name: 'english'},
                    {id: 'nl', name: 'nederlands'},
                ],
                selected: {id: null, name: null},
            },
        }, initialState)
    }


    /**
    * Initialize multi-language support. An I18nStore is mounted
    * to the store. Translations can be dynamically added. Then initialize Vue
    * with the Vue-stash store, the root rendering component and gathered
    * watchers from modules.
    * @param {Object} options - Options to pass to Vue.
    * @param {Object} options.main - Main component to initialize with.
    * @param {Object} options.settings - Extra settings passed to Vue.
    */
    _initViewModel({main, settings = {}} = {}) {
        this.logger.info(`${this}init viewmodel`)
        const i18nStore = new I18nStore(this.state)
        Vue.use(I18nStash, i18nStore)

        for (const [id, translation] of Object.entries(this.i18n.translations)) {
            Vue.i18n.add(id, translation)
        }

        this._languagePresets()

        // Add a shortcut to the translation module.
        this.$t = Vue.i18n.translate
        this.vm = new Vue(Object.assign({
            data: {store: this.state},
            render: h => h(main),
        }, settings))

        if (this.env.isBrowser) this.vm.$mount(document.querySelector('#app'))
    }


    /**
    * Check if a variable is an object.
    * @param {Array|null|Number|Object} item - The object to check. Can be of any type.
    * @returns {Boolean} Whether the variable is an object or not.
    */
    _isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item))
    }


    /**
    * Set the language from browser presets when it
    * can't be derived from the application state.
    */
    _languagePresets() {

        let language = this.state.language.selected

        if (!language.id) {
            const options = this.state.language.options
            // Try to figure out the language from the environment.
            // Check only the first part of en-GB/en-US.
            if (this.env.isBrowser) language = options.find((i) => i.id === navigator.language.split('-')[0])
            else if (process.env.LANGUAGE) {
                language = options.find((i) => i.id === process.env.LANGUAGE.split('_')[0])
            }
            // Fallback to English language as a last resort.
            if (!language) language = options.find((i) => i.id === 'en')
        }

        this.logger.info(`${this}language: ${language.id}`)
        this.setState({language: {selected: language}}, {persist: this.state.user && this.state.session.authenticated})
        Vue.i18n.set(language.id)
    }


    /**
    * Load section plugins from browserified modules. This is basically
    * the browser-side of the `jsPlugins` browserify handler in
    * `tools/helpers.js`.
    * @param {Object} modules - See .ca11rc.example for the format.
    */
    _loadModules(modules) {
        // Start by initializing builtin plugins.
        for (const builtin of modules) {
            if (builtin.addons) {
                const addonModules = builtin.addons[this._appSection].map((addon) => {
                    return require(`${addon}/src/js/${this._appSection}`)
                })
                this.modules[builtin.name] = new builtin.module(this, addonModules)
            } else if (builtin.providers) {
                const providerModules = builtin.providers.map((mod) => {
                    return require(`${mod}/src/js/${this._appSection}`)
                })
                this.modules[builtin.name] = new builtin.module(this, providerModules)
            } else if (builtin.adapter) {
                const adapterModule = require(`${builtin.adapter}/src/js/${this._appSection}`)
                this.modules[builtin.name] = new builtin.module(this, adapterModule)
            } else {
                // Other plugins without any config.
                this.modules[builtin.name] = new builtin.module(this, null)
            }
        }
    }


    /**
    * A recursive method that merges two or more objects with
    * nesting together. Existing values from target are
    * overwritten by sources.
    * @param {Object} target - The store or a fragment of it.
    * @param {...*} sources - One or more objects to merge to target.
    * @returns {Function} - The result of this method.
    */
    _mergeDeep(target, ...sources) {
        if (!sources.length) return target
        const source = sources.shift()

        if (this._isObject(target) && this._isObject(source)) {
            for (const key in source) {
                if (this._isObject(source[key])) {
                    if (!target[key]) Object.assign(target, {[key]: {}})
                    this._mergeDeep(target[key], source[key])
                } else if (Array.isArray(source[key])) {
                    Object.assign(target, {[key]: source[key]})
                } else {
                    target[key] = source[key]
                }
            }
        }

        return this._mergeDeep(target, ...sources)
    }


    /**
    * Vue-friendly object merging. The `path` is used to assist
    * Vue's reactivity system to catch up with changes.
    * @param {Object} options - Options to pass.
    * @param {String} [options.action=upsert] - The merge action: upsert|delete|replace.
    * @param {Boolean} [options.encrypt=true] - Whether to persist to the encrypted part of the store.
    * @param {String} [options.path=null] - The path.to.the.store.item to merge.
    * @param {Boolean} [options.persist=false] - Whether to persist this state change.
    *  @param {String} [options.source=null] - Merge into a custom object instead of the default store.
    * @param {Object} state - An object to merge into the store.
    */
    _mergeState({action = 'upsert', encrypt = true, path = null, persist = false, source = null, state}) {
        let stateSource
        if (source) stateSource = source
        else stateSource = this.state

        if (!path) {
            this._mergeDeep(stateSource, state)
            return
        }

        path = path.split('.')
        if (action === 'upsert') {
            let _ref = this.__getKeyPath(stateSource, path)
            // Needs to be created first.
            if (typeof _ref === 'undefined') {
                this._setKeyPath(stateSource, path, state)
            } else {
                _ref = path.reduce((o, i)=>o[i], stateSource)
                this._mergeDeep(_ref, state)
            }
        } else if (action === 'delete') {
            const _ref = path.slice(0, path.length - 1).reduce((o, i)=>o[i], stateSource)
            this.vm.$delete(_ref, path[path.length - 1])
        } else if (action === 'replace') {
            const _ref = path.slice(0, path.length - 1).reduce((o, i)=>o[i], stateSource)
            this.vm.$set(_ref, path[path.length - 1], state)
        } else {
            throw new Error(`invalid path action for _mergeState: ${action}`)
        }
    }


    /**
    * Set a nested property's value from a string pointing
    * to the reference. To set the value of `foo` in `path.to.foo`,
    * set the path to `path.to.foo`, give the reference object and
    * its value.
    * @param {Object} obj - Reference object to modify.
    * @param {Array} keypath - The keypath to set.
    * @param {*} value - The value to assign to the keypath's final key.
    * @returns {Function|Object} - Recursive until the property is set. Then returns the reference object.
    */
    _setKeyPath(obj, keypath, value) {
        if (keypath.length === 1) {
            // Arrived at the end of the path. Make the property reactive.
            if (!obj[keypath[0]]) this.vm.$set(obj, keypath[0], value)
            return obj[keypath[0]]
        } else {
            if (!obj[keypath[0]]) obj[keypath[0]] = {}
            return this._setKeyPath(obj[keypath[0]], keypath.slice(1), value)
        }
    }


    /**
    * Store a notification in the (memory) store, which lets
    * the notification component render the notification.
    * @param {Object} notification - A notification object to add.
    */
    notify(notification) {
        if (typeof notification.timeout === 'undefined') {
            notification.timeout = 1500
        }
        notification.id = shortid.generate()
        let notifications = this.state.app.notifications
        notifications.push(notification)
        this.setState({app: {notifications}})
    }


    /**
    * Set the state within the own running script context
    * and then propagate the state to the other logical
    * endpoint for syncing.
    * @param {Object} state - The state to update.
    * @param {Boolean} options - Whether to persist the changed state to localStorage.
    */
    setState(state, {action, encrypt, path, persist} = {}) {
        if (!action) action = 'upsert'
        // Merge state in the context of the executing script.
        this._mergeState({action, encrypt, path, persist, state})
    }
}

export default App
