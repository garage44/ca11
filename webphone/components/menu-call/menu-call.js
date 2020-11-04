export default (app) => {
    return {
        computed: Object.assign({
            call: function() {
                return this.callActive
            },
            callStatus: function() {
                if (!this.callActive) {
                    if (this.description.protocol === 'sip') {
                        if (!this.sip.enabled) return this.$t('sip disabled')
                        if (this.sip.status === 'registered') {
                            return `${this.$t('ready to call')}...`
                        }
                        return this.$t(this.sip.status)

                    } else if (this.description.protocol === 'sig11') {
                        if (!this.sig11.enabled) return this.$t('sig11 disabled')
                    } else if (this.description.protocol === 'ion') {
                        if (!this.ion.enabled) return this.$t('ion disabled')
                    }

                    return `${this.$t('ready to call')}...`
                }
                const translations = app.helpers.getTranslations().call
                if (this.call.hold.active) return translations.hold
                return translations[this.call.status]
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
            ion: 'ion',
            sig11: 'sig11',
            sip: 'sip',
        },
    }
}
