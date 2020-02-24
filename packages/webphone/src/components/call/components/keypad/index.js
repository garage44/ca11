export default (app) => {

    const CallKeypad = {
        computed: Object.assign({
            matchedContact: function() {
                let _number = String(this.number)
                if (_number.length > 1) {
                    let match = app.helpers.matchContact(String(this.number), true)
                    if (match) {
                        return {
                            contact: this.contacts[match.contact],
                            number: this.contacts[match.contact].endpoints[match.number],
                        }
                    }
                }
                return null
            },
        }, app.helpers.sharedComputed()),
        methods: Object.assign({
            activateMedia: function() {
                let selected = this.stream[this.stream.type].selected
                if (!selected) selected = new Date().getTime()
                else selected = null

                app.setState({
                    settings: {webrtc: {media: {stream: {[this.stream.type]: {selected}}}}},
                }, {persist: true})

                app.emit('caller:call-activate', {callId: null})
            },
            press: function(key) {
                if (this.mode === 'dtmf') {
                    app.emit('sip:dtmf', {callId: this.call.id, key})
                }
                this.description.endpoint += key
            },
        }, app.helpers.sharedMethods()),
        props: {
            call: {default: null},
            dtmf: {default: false, type: Boolean},
            endpoint: {default: ''},
            mode: {default: 'call', type: String},
            search: {default: true, type: Boolean},
        },
        render: templates.call_keypad.r,
        staticRenderFns: templates.call_keypad.s,
        store: {
            calls: 'caller.calls',
            contacts: 'contacts.contacts',
            description: 'caller.description',
            env: 'env',
            sig11: 'sig11',
            sip: 'sip',
            stream: 'settings.webrtc.media.stream',
            ui: 'ui',
        },
        watch: {
            'description.protocol': function(protocol) {
                app.setState({calls: {description: {protocol}}}, {persist: true})
            },
            endpoint: function(endpoint) {
                if (this.callingDisabled) return
                let cleanedNumber = endpoint
                cleanedNumber = app.utils.sanitizeNumber(endpoint)
                this.$emit('update:model', cleanedNumber)
            },
        },
    }

    return CallKeypad
}
