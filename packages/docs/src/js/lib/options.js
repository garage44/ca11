module.exports = (function() {
    const env = require('ca11-skeleton/env')()

    let options = {
        env,
        plugins: {
            builtin: [
                {module: require('../plugins/page'), name: 'page'},
            ],
            custom: [],
        },
    }

    return options
})()
