export default (app) => {
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
                return app.modules.caller.calls[this.call.id].timer().formatted
            },
        }, app.helpers.sharedComputed()),
        methods: app.helpers.sharedMethods(),
        store: {
            calls: 'caller.calls',
            description: 'caller.description',
        },
    }

    return Bar
}
