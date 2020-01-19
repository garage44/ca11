module.exports = (app) => {

    const ProtocolStatus = {
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
        methods: Object.assign({
            classes: function(block) {
                const classes = {}
                if (block === 'media-type') {
                    classes[this.stream.type] = true
                }

                // We assume here that a block is always an option. Change
                // this logic if other kind of blocks are required.
                classes.active = (this.layer === block)

                if (block === 'activities') {
                    classes.unread = this.activities.unread
                } else if (block === 'caller') {
                    classes.disabled = !this.app.online
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
        }, app.helpers.sharedMethods()),
        props: ['call'],
        render: templates.protocol_status.r,
        staticRenderFns: templates.protocol_status.s,
        store: {
            activities: 'activities',
            calls: 'caller.calls',
            description: 'caller.description',
            dnd: 'app.dnd',
            layer: 'ui.layer',
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

    return ProtocolStatus
}
