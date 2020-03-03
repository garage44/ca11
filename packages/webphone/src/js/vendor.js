import EventEmitter from 'eventemitter3'
import Vue from 'vue/dist/vue.runtime.js'
import VueSvgicon from 'vue-svgicon'
// import VueAutosize from 'vue-autosize'
import Vuelidate from 'vuelidate'
import VuelidateValidators from 'vuelidate/dist/validators.min.js'

import vClickOutside from 'v-click-outside'
import VueStash from 'vue-stash'

import VueI18n from '@garage11/vue-i18n'
import VueI18nStash from '@garage11/vue-i18n/src/store-stash.js'

import SIP from 'sip.js/dist/sip.js'
import sdpInterop from 'sdp-interop-sl'

// import d3Array from 'd3-array'
// import d3Force from 'd3-force'

globalThis.SIP = SIP
globalThis.EventEmitter = EventEmitter
globalThis.Vue = Vue
globalThis.Vuelidate = Vuelidate
globalThis.Vuelidate.validators = VuelidateValidators

if (globalThis.document) {
    window.globalThis = window
    globalThis.$ = document.querySelector.bind(document)
    globalThis.$$ = document.querySelectorAll.bind(document)
}

Vue.config.ignoredElements = ['component', 'panel', 'content']
Vue.config.productionTip = false
Vue.config.devtools = false

console.log(VueSvgicon)
Vue.use(VueSvgicon, {tagName: 'icon'})

if (globalThis.document) {
    Vue.use(globalThis.Vuelidate)
}

Vue.use(vClickOutside)
Vue.use(VueStash)

globalThis.I18nStash = VueI18n
globalThis.I18nStore = VueI18nStash

// FIXME: shortid replacement
globalThis.shortid = function() {
    var result           = ''
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length
    for ( var i = 0; i < 6; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}
globalThis.SIP = SIP
globalThis.sdpInterop = sdpInterop.InteropChrome

// globalThis.d3 = {}
// Object.assign(globalThis.d3, d3Array)
// Object.assign(globalThis.d3, d3Force)


if (!globalThis.translations) globalThis.translations = {}

