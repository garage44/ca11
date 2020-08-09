export default (app) => {
    return {
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
        methods: {
            callDescription: function(...args) {
                app.modules.caller.call(...args)
            },
        },
        store: {
            calls: 'caller.calls',
            description: 'caller.description',
        },
    }
}
