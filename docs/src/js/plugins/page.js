const Plugin = require('ca11/lib/plugin')

class PluginPage extends Plugin {

    constructor(app) {
        super(app)

        app.router.addRoutes([{
            component: app.components.Page,
            name: 'developers',
            path: '/developers/:topic_id',
        }])

        app.router.addRoutes([{
            component: app.components.Page,
            name: 'users',
            path: '/users/:topic_id',
        }])
    }


    /**
    * Generate a representational name for this module. Used for logging.
    * @returns {String} - An identifier for this module.
    */
    toString() {
        return `${this.app}[app] `
    }
}


module.exports = PluginPage
