import env from './env.js'
import EventEmitter from 'eventemitter3'
import filters from './filters.js'
import helpers from './helpers.js'
import I18nTranslations from '../i18n/i18n.js'
import Logger from './logger.js'
import shortid from 'shortid/lib/index.js'
import Utils from './utils.js'
import Vue from 'vue/dist/vue.runtime.js'
import VueI18n from '@garage11/vue-i18n'
import VueI18nStash from '@garage11/vue-i18n/src/store-stash.js'

globalThis.shortid = shortid


class App extends EventEmitter {

    constructor(settings) {
        super(settings)
        this.env = env()
        this.Vue = Vue

        this.utils = new Utils()
        this.logger = new Logger(this)

        this.logger.setLevel('debug')

        this.i18n = new I18nTranslations(this)

        this.$t = (text) => text
        this.filters = filters(this)
        this.helpers = helpers(this)

        this._state = {}
        if (settings.modules) {
            this.__modules = settings.modules
        }
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
            // eslint-disable-next-line no-prototype-builtins
            if (!obj || !obj.hasOwnProperty(keypath[0])) return undefined
            return obj[keypath[0]]
        } else {
            if (!obj) return undefined
            return this.__getKeyPath(obj[keypath[0]], keypath.slice(1))
        }
    }


    _initialState() {
        let state = this.utils.copyObject(this._state)
        for (let name of Object.keys(this.modules)) {
            if (this.modules[name]._initialState) {
                state[name] = this.modules[name]._initialState()
            }
        }

        return state
    }


    _initStore(initialState = {}) {
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


    _initViewModel({main, settings = {}} = {}) {
        this.logger.info(`${this}init viewmodel`)
        const i18nStore = new VueI18nStash(this.state)
        Vue.use(VueI18n, i18nStore)

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

        if (this.env.isBrowser) {
            this.logger.info(`${this}mounting vdom`)
            this.vm.$mount(document.querySelector('#app'))
        }
    }


    _isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item))
    }


    _languagePresets() {
        let language = this.state.language.selected

        if (!language.id) {
            const options = this.state.language.options
            // Try to figure out the language from the environment.
            // Check only the first part of en-GB/en-US.
            if (this.env.isBrowser) language = options.find((i) => i.id === navigator.language.split('-')[0])

            // else if (process.env.LANGUAGE) {
            //     language = options.find((i) => i.id === process.env.LANGUAGE.split('_')[0])
            // }
            // Fallback to English language as a last resort.
            if (!language) language = options.find((i) => i.id === 'en')
        }

        this.logger.info(`${this}language: ${language.id}`)
        this.setState({language: {selected: language}}, {persist: this.state.user && this.state.session.authenticated})
        Vue.i18n.set(language.id)
    }


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


    _mergeState({action = 'upsert', path = null, source = null, state}) {
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


    notify(notification) {
        if (typeof notification.timeout === 'undefined') {
            notification.timeout = 1500
        }
        notification.id = shortid()
        let notifications = this.state.app.notifications
        notifications.push(notification)
        this.setState({app: {notifications}})
    }


    setState(state, {action, encrypt, path, persist} = {}) {
        if (!action) action = 'upsert'
        // Merge state in the context of the executing script.
        this._mergeState({action, encrypt, path, persist, state})
    }
}

export default App
