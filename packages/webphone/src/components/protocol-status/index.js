export default (app) => {

    const ProtocolStatus = {
        computed: {
            classes: function() {
                const classes = {}

                if (this.sip.enabled) classes[`sip-${this.sip.status}`] = true
                else classes['sip-disabled'] = true

                if (this.sig11.enabled) classes[`sig11-${this.sig11.status}`] = true
                else classes['sig11-disabled'] = true

                return classes
            },
            protocols: function() {
                let protocols = [
                    {disabled: !this.sip.enabled, icon: 'protocol-sip', name: 'SIP', value: 'sip'},
                    {disabled: !this.sig11.enabled, icon: 'protocol-sig11', name: 'SIG11', value: 'sig11'},
                ]

                return protocols
            },
            tooltip: function() {
                const sipStatus = this.sip.enabled ? this.sip.status : this.$t('disabled')
                return `SIP: ${sipStatus}\nSIG11: ${this.sig11.status}`
            },
        },
        render: templates.protocol_status.r,
        staticRenderFns: templates.protocol_status.s,
        store: {
            description: 'caller.description',
            sig11: 'sig11',
            sip: 'sip',
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
