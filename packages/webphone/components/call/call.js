export default (app) => {
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
        store: {
            calls: 'caller.calls',
            description: 'caller.description',
        },
    }

    return Call
}
