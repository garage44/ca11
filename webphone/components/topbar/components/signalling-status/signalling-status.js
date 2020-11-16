export default (app) => {

    return {
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
                    {disabled: false, icon: 'protocol-ion', name: 'ION', value: 'ion'},
                ]

                return protocols
            },
            signalStatus: function() {
                if (!this.callActive) {
                    if (!this.description.endpoint) {
                        return `${this.$t('enter a number, name or public key')}`
                    } else if (this.description.protocol === 'sip') {
                        if (!this.sip.enabled) return this.$t('sip disabled')
                        if (this.sip.status === 'registered') {
                            return `${this.$t('start a new call')}...`
                        }
                        return this.$t(this.sip.status)

                    } else if (this.description.protocol === 'sig11') {
                        if (!this.sig11.enabled) return this.$t('sig11 disabled')
                    } else if (this.description.protocol === 'ion') {
                        if (!this.ion.enabled) return this.$t('ion disabled')
                    }

                    return `${this.$t('start a new call')}...`
                }
                const translations = app.helpers.getTranslations().call
                if (this.call.hold.active) return translations.hold
                return translations[this.call.status]
            },
            tooltip: function() {
                const sipStatus = this.sip.enabled ? this.sip.status : this.$t('disabled')
                return `SIP: ${sipStatus}\nSIG11: ${this.sig11.status}`
            },
        },
        store: {
            description: 'caller.description',
            ion: 'ion',
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
}
