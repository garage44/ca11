module.exports = (app) => {

    const MediaControls = {
        data: function() {
            return {
                tooltip: {
                    sig11: '',
                    sip: '',
                },
            }
        },
        methods: {
            classes: function(block) {
                const classes = {}
                if (block === 'media-type') {
                    classes[this.stream.type] = true
                }
                return classes
            },
            toggleSelect: function() {
                let selected = this.stream[this.stream.type].selected
                if (!selected) selected = new Date().getTime()
                else selected = null
                app.setState({
                    settings: {webrtc: {media: {stream: {[this.stream.type]: {selected}}}}},
                    ui: {layer: 'caller'},
                }, {persist: true})
            },
        },
        props: ['call'],
        render: templates.media_controls.r,
        staticRenderFns: templates.media_controls.s,
        store: {
            calls: 'caller.calls',
            settings: 'settings',
            sig11: 'sig11',
            sip: 'sip',
            stream: 'settings.webrtc.media.stream',
        },
    }

    return MediaControls
}
