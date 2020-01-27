module.exports = (app) => {
    const components = {
        CallInputEndpoint: require('./components/input-endpoint'),
        CallOptions: require('./components/options'),
        CallTransfer: require('./components/transfer'),
        Keypad: require('./components/keypad'),
    }

    for (const [name, component] of Object.entries(components)) {
        app.components[name] = Vue.component(name, component(app))
    }


    /**
    * @memberof fg.components
    */
    const Call = {
        computed: app.helpers.sharedComputed(),
        data: function() {
            return {
                intervalId: 0,
                keypad: false,
            }
        },
        destroyed: function() {
            clearInterval(this.intervalId)
        },
        props: ['call'],
        render: templates.call.r,
        staticRenderFns: templates.call.s,
        store: {
            calls: 'caller.calls',
            description: 'caller.description',
        },
    }

    return Call
}
