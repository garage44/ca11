// Import all vector icons at once.
import '@ca11/theme/icons/index.js'

import Crypto from '@ca11/sig11/lib/crypto.js'
import Devices from './lib/devices.js'
import env from './lib/env.js'
import EventEmitter from 'eventemitter3'
import filters from './lib/filters.js'
import helpers from './lib/helpers.js'
import I18nTranslations from './i18n/i18n.js'
import Logger from './lib/logger.js'
import Media from './lib/media.js'
import { mergeState } from '/webphone/lib/state.js'
import options from './lib/options.js'
import Session from './lib/session.js'
import shortid from 'shortid/lib/index.js'
import Sounds from './lib/sounds.js'

import StateStore from './lib/store.js'
import vClickOutside from 'v-click-outside'
import Vue from 'vue/dist/vue.runtime.js'
import VueI18n from '@garage11/vue-i18n'
import VueI18nStash from '@garage11/vue-i18n/src/store-stash.js'
import Vuelidate from 'vuelidate'
import vuepack from './vuepack.js'
import VueStash from 'vue-stash'
import VueSvgicon from 'vue-svgicon'

// import VueAutosize from 'vue-autosize'

Vue.config.ignoredElements = ['component', 'panel', 'content']
Vue.config.productionTip = false
Vue.config.devtools = false

Vue.use(VueSvgicon, {tagName: 'icon'})
Vue.use(Vuelidate)
Vue.use(vClickOutside)
Vue.use(VueStash)

globalThis.shortid = shortid


class WebphoneApp extends EventEmitter {

    constructor(settings) {
        super()

        this.env = env()
        this.Vue = Vue

        this.logger = new Logger(this)
        this.logger.setLevel('debug')

        this.i18n = new I18nTranslations(this)
        this.$t = (text) => text

        this.filters = filters(this)
        this.helpers = helpers(this)

        this.session = new Session(this)
        this.stateStore = new StateStore(this)
        this.crypto = new Crypto(this)

        this.components = vuepack(this)

        this.modules = {}
        this.clients = {}

        for (const builtin of settings.modules) {
            // Other plugins without any config.
            this.modules[builtin.name] = new builtin.module(this, null)
        }

        this.media = new Media(this)
        this.sounds = new Sounds(this)

        this.initStore()
    }


    /**
    * Load store defaults and restore the encrypted state from
    * localStorage, if the session can be restored immediately.
    * Load a clean state from defaults otherwise. Then initialize
    * the ViewModel and check for the data schema. Do a factory reset
    * if the data schema is outdated.
    */
    async initStore() {
        this.state = {
            env: this.env,
            language: {
                options: [
                    {id: 'en', name: 'english'},
                    {id: 'nl', name: 'nederlands'},
                ],
                selected: {id: null, name: null},
            },
        }

        await this.session.change('active')
        // The vault always starts in a locked position.
        this.setState({
            app: {vault: {unlocked: false}},
            ui: {menubar: {base: 'inactive', event: null}},
        })

        // No session yet.
        if (!this.state.app.vault.key) {
            this.initVm({main: this.components.Main})
        } else {
            await this.session.open({key: this.state.app.vault.key})
            // (!) State is reactive only after initializing the viewmodel.
            this.initVm({main: this.components.Main})
            this.session.initVmWatchers()
        }

        this.devices = new Devices(this)

        // Call all ready hooks on modules; e.g. the webphone is ready.
        for (let module of Object.keys(this.modules)) {
            if (this.modules[module].appReady) this.modules[module].appReady()
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


    initVm({main, settings = {}} = {}) {
        this.logger.info(`init viewmodel`)
        const i18nStore = new VueI18nStash(this.state)
        Vue.use(VueI18n, i18nStore)

        for (const [id, translation] of Object.entries(this.i18n.translations)) {
            Vue.i18n.add(id, translation)
        }

        this.setLanguage()
        // Add a shortcut to the translation module.
        this.$t = Vue.i18n.translate

        this.vm = new Vue(Object.assign({
            data: {store: this.state},
            render: h => h(main),
        }, settings))

        if (this.env.isBrowser) {
            this.logger.info(`mounting vdom`)
            this.vm.$mount(document.querySelector('#app'))
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


    setLanguage() {
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

        this.logger.info(`language: ${language.id}`)
        this.setState({language: {selected: language}}, {persist: this.state.user && this.state.session.authenticated})
        Vue.i18n.set(language.id)
    }


    async setState(state, {action, encrypt, path, persist = false} = {}) {
        if (!action) action = 'upsert'
        // Merge state in the context of the executing script.
        await mergeState(this, {action, encrypt, path, persist, state})
    }
}

if (options.env.isBrowser) {
    const app = new WebphoneApp(options)
    globalThis.app = app
}

export default {WebphoneApp, options}
