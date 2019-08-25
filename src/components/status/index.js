module.exports = (app) => {
    const components = {
        StatusCall: require('./components/call'),
        StatusMenu: require('./components/menu'),
    }

    for (const [name, component] of Object.entries(components)) {
        app.components[name] = Vue.component(name, component(app))
    }

    /**
    * @memberof fg.components
    */
    const Status = {
        computed: app.helpers.sharedComputed(),
        methods: app.helpers.sharedMethods(),
        render: templates.status.r,
        staticRenderFns: templates.status.s,
        store: {
            calls: 'caller.calls',
        },
    }

    return Status
}
