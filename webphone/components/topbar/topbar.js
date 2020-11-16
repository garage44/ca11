export default (app) => {
    return {
        computed: Object.assign({
            call: function() {
                return this.callActive
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
