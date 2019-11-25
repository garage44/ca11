require('module-alias/register')

const App = require('ca11/lib/app')
require('./i18n')

class Docs extends App {

    constructor(options) {
        super(options)

        const components = {
            Page: require('../components/page'),
            Sidebar: require('../components/sidebar'),
            Welcome: require('../components/welcome'),
        }

        this.components = {}

        for (const name of Object.keys(components)) {
            this.components[name] = Vue.component(name, components[name](this))
        }

        Vue.component('VRuntimeTemplate', require('v-runtime-template/dist/v-runtime-template.cjs'))

        this._initStore({
            app: {
                name: process.env.APP_NAME,
            },
            pages: global.pages,
            vendor: {
                name: process.env.VENDOR_NAME,
                website: process.env.VENDOR_WEBSITE,
            },
            version: {
                current: process.env.VERSION,
            },
        })

        this.router = this.setupRouter()

        this.router.addRoutes([{
            component: this.components.Welcome,
            name: 'welcome',
            path: '/',
        }])

        this._loadPlugins(this.__plugins)
        this._initViewModel({
            main: require('../components/main')(this),
            settings: {router: this.router},
        })
    }


    setupRouter() {
        Vue.use(VueRouter)

        const router = new VueRouter({
            base: '/',
            linkActiveClass: 'active',
            mode: 'history',
        })

        return router
    }
}

global.options = require('./lib/options')

global.Docs = Docs
module.exports = Docs
