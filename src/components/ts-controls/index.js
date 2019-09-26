module.exports = (app) => {

    const TsControls = {
        computed: {
            protocols: function() {
                let protocols = [
                    {disabled: !this.sip.enabled, name: 'SIP', value: 'sip'},
                    {disabled: !this.sig11.enabled, name: 'SIG11', value: 'sig11'},
                ]
                return protocols
            },
        },
        data: function() {
            return {
                tooltip: 'SIG11: enabled\nSIP:Disabled',
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
        render: templates.ts_controls.r,
        staticRenderFns: templates.ts_controls.s,
        store: {
            calls: 'caller.calls',
            description: 'caller.description',
            dnd: 'app.dnd',
            settings: 'settings',
            sig11: 'sig11',
            sip: 'sip',
            stream: 'settings.webrtc.media.stream',
        },
        watch: {
            'description.protocol': function(protocol) {
                app.setState({calls: {description: {protocol}}}, {persist: true})
            },
            dnd: function(dnd) {
                app.setState({app: {dnd}}, {persist: true})
            },
        },
    }

    return TsControls
}
