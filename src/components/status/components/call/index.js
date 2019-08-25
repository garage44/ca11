module.exports = (app) => {
    /**
    * @memberof fg.components
    */
    const Call = {
        computed: Object.assign({
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
        props: ['call'],
        render: templates.status_call.r,
        staticRenderFns: templates.status_call.s,
        store: {
            description: 'caller.description',
        },
    }

    return Call
}
