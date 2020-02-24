export default (app) => {

    const sharedComputed = app.helpers.sharedComputed()

    const AudioBg = {
        computed: {
            call: sharedComputed.callActive,
        },
        methods: {

        },
        render: templates.audio_bg.r,
        staticRenderFns: templates.audio_bg.s,
        store: {
            calls: 'caller.calls',
        },
    }

    return AudioBg
}
