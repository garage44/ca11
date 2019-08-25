if (global.document) {
    window.global = window
    global.$ = document.querySelector.bind(document)
    global.$$ = document.querySelectorAll.bind(document)
}

global.Vue = require('vue/dist/vue.runtime')
Vue.config.ignoredElements = ['component']

if (process.env.NODE_ENV === 'production') {
    Vue.config.productionTip = false
    Vue.config.devtools = false
}

Vue.use(require('vue-svgicon'), {tagName: 'icon'})
if (global.document) {
    Vue.use(require('vue-autosize'))
    global.Vuelidate = require('vuelidate')
    global.Vuelidate.validators = require('vuelidate/dist/validators.min')
    Vue.use(global.Vuelidate.default)
}
Vue.use(require('v-click-outside'))
Vue.use(require('vue-stash').default)

global.I18nStash = require('@garage11/vue-i18n')
global.I18nStore = require('@garage11/vue-i18n/src/store-stash')

global.shortid = require('shortid')
global.SIP = require('sip.js')
global.sdpInterop = require('sdp-interop-sl').InteropChrome

global.d3 = {}
Object.assign(global.d3, require('d3-array'))
Object.assign(global.d3, require('d3-force'))

global.Raven = require('raven-js')

global.EventEmitter = require('eventemitter3')
if (!global.translations) global.translations = {}

