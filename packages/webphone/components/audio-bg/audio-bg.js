export default (app) => {

    const sharedComputed = app.helpers.sharedComputed()

    const AudioBg = {
        computed: {
            call: sharedComputed.callActive,
        },
        methods: {

        },
        store: {
            calls: 'caller.calls',
        },
    }

    return AudioBg
}
