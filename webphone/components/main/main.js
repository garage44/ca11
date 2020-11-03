export default (app) => {

    return {
        computed: app.helpers.sharedComputed(),
        data: function() {
            return {
                currentSplash: 0,
            }
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

                return classes
            },
            logout: function() {
                app.session.close()
            },
        }, {}),
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
}
