export default (function() {
    const env = require('@ca11/boilerplate/env')()

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
