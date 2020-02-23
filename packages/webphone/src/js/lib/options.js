/**
* Setup options to run a bg instance of Ca11 can be a bit
* verbose, that's why this is handled from one place for both
* Node and Browsers.
*/
export default (function() {
    const env = require('@ca11/boilerplate/src/env')({})

    let options = {
        env,
        modules: [
            {module: require('../modules/activities'), name: 'activities'},
            {module: require('../modules/app'), name: 'app'},
            {module: require('../modules/caller'), name: 'caller'},
            {
                i18n: null,
                module: require('../modules/contacts'),
                name: 'contacts',
                providers: null,
            },
            {module: require('../modules/settings'), name: 'settings'},
            {module: require('../modules/sig11'), name: 'sig11'},
            {module: require('../modules/sip'), name: 'sip'},
            {module: require('../modules/ui'), name: 'ui'},
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
