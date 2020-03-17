if (global.document) {
    window.global = window
    global.$ = document.querySelector.bind(document)
    global.$$ = document.querySelectorAll.bind(document)
}

global.Vue = require('vue/dist/vue.common')
Vue.config.ignoredElements = ['component']

if (process.env.NODE_ENV === 'production') {
    Vue.config.productionTip = false
    Vue.config.devtools = false
}

Vue.use(require('vue-highlightjs'))
Vue.use(require('vue-svgicon'), {tagName: 'icon'})


global.VueRouter = require('vue-router')
Vue.use(require('vue-stash').default)

global.I18nStash = require('@garage11/vue-i18n')
global.I18nStore = require('@garage11/vue-i18n/src/store-stash')

global.shortid = require('shortid')

global.EventEmitter = require('eventemitter3')
if (!global.translations) global.translations = {}

