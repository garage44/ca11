export default (app) => {

    let splashInterval

    /**
    * @memberof fg.components
    */
    const Main = {
        computed: app.helpers.sharedComputed(),
        data: function() {
            return {
                currentSplash: 0,
            }
        },
        destroyed: function() {
            clearInterval(splashInterval)
        },

        methods: Object.assign({
            classes: function(block) {
                let classes = {}

                if (block === 'component') {
                    classes[`theme-${this.ui.theme}`] = true
                } else if (block === 'panel') {
                    if (this.session.authenticated) classes.sidebar = true
                    if (this.overlay) classes['no-scroll'] = true
                }

                classes[`splash-${this.currentSplash}`] = true

                return classes
            },
        }, app.helpers.sharedMethods()),
        mounted: function() {
            splashInterval = setInterval(() => {
                this.currentSplash = (this.currentSplash + 1) % 7
            }, 10000)
        },
        render: templates.main.r,
        staticRenderFns: templates.main.s,
        store: {
            calls: 'caller.calls',
            description: 'caller.description',
            layer: 'ui.layer',
            overlay: 'ui.overlay',
            session: 'session',
            telemetry: 'settings.telemetry',
            ui: 'ui',
        },
    }

    return Main
}
