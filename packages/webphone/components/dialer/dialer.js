export default (app) => {
    const sharedComputed = app.helpers.sharedComputed()

    return {
        computed: Object.assign({
            callActive: sharedComputed.callActive,
            protocols: function() {
                let protocols = [
                    {disabled: !this.sig11.enabled, name: 'sig11', value: 'sig11'},
                    {disabled: !this.sip.enabled, name: 'sip', value: 'sip'},
                ]
                return protocols
            },
        }, app.helpers.sharedComputed()),
        methods: Object.assign({
            classes: function(block) {
                let classes = {}
                if (block === 'component') {
                    if (this.callOngoing) classes['t-st-caller-ongoing'] = true
                    else classes['t-st-caller-idle'] = true
                }
                return classes
            },
        }, app.helpers.sharedMethods()),
        store: {
            calls: 'caller.calls',
            description: 'caller.description',
            sig11: 'sig11',
            stream: 'settings.webrtc.media.stream',
            ui: 'ui',
        },
        watch: {
            'description.protocol': function(protocol) {
                app.setState({caller: {description: {
                    endpoint: '',
                    protocol,
                }}}, {persist: true})
            },
        },
    }
}
