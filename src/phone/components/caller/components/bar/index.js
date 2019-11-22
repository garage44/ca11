module.exports = (app) => {
    /**
    * @memberof fg.components
    */
    const Bar = {
        computed: Object.assign({
            call: function() {
                return this.callActive
            },
            callStatus: function() {
                const translations = app.helpers.getTranslations().call
                if (this.call.hold.active) return translations.hold
                return translations[this.call.status]
            },
            sessionTime: function() {
                return app.plugins.caller.calls[this.call.id].timer().formatted
            },
        }, app.helpers.sharedComputed()),
        methods: app.helpers.sharedMethods(),
        render: templates.caller_bar.r,
        staticRenderFns: templates.caller_bar.s,
        store: {
            calls: 'caller.calls',
            description: 'caller.description',
        },
    }

    return Bar
}
