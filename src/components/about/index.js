module.exports = (app) => {
    /**
    * @memberof fg.components
    */
    const About = {
        methods: app.helpers.sharedMethods(),
        render: templates.about.r,
        staticRenderFns: templates.about.s,
        store: {
            app: 'app',
            vendor: 'app.vendor',
        },
    }

    return About
}
