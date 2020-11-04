import activities from '../modules/activities.js'
import app from '../modules/app.js'
import caller from '../modules/caller.js'
import contacts from '../modules/contacts/contacts.js'
import env from './env.js'

import ion from '../modules/ion.js'
import settings from '../modules/settings.js'
import sig11 from '../modules/sig11.js'
import sip from '../modules/sip.js'
import ui from '../modules/ui.js'


export default (function() {
    let options = {
        env: env({}),
        modules: [
            {module: activities, name: 'activities'},
            {module: app, name: 'app'},
            {module: caller, name: 'caller'},
            {
                i18n: null,
                module: contacts,
                name: 'contacts',
                providers: null,
            },
            {module: settings, name: 'settings'},
            {module: sig11, name: 'sig11'},
            {module: sip, name: 'sip'},
            {module: ion, name: 'ion'},
            {module: ui, name: 'ui'},
        ],
    }


    // Load plugins from settings.
    if (env.isNode) {
        const rc = require('rc')
        let settings = {}
        rc('ca11', settings)
    }

    return options
})()
