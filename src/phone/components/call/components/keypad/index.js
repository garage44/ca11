module.exports = (app) => {

    const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '#']

    /**
    * @memberof fg.components
    */
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
            protocols: function() {
                let protocols = [
                    {disabled: !this.sip.enabled, name: 'SIP', value: 'sip'},
                    {disabled: !this.sig11.enabled, name: 'SIG11', value: 'sig11'},
                ]
                return protocols
            },
        }, app.helpers.sharedComputed()),
        methods: Object.assign({
            activateMedia: function() {
                let selected = this.stream[this.stream.type].selected
                if (!selected) selected = new Date().getTime()
                else selected = null


                app.setState({
                    settings: {webrtc: {media: {stream: {[this.stream.type]: {selected}}}}},
                    ui: {layer: 'caller'},
                }, {persist: true})

                app.emit('caller:call-activate', {callId: null})
            },
            callDescription: function(...args) {app.plugins.caller.call(...args)},
            callTitle: function(call) {
                const translations = app.helpers.getTranslations().call
                let text
                if (!call) {
                    text = translations.media
                } else {
                    text = `${call.number} - `
                    if (call.hold.active) text += translations.hold
                    else text += translations[call.status]
                }

                return text.ca()
            },
            inputChange: function(newVal) {
                this.$emit('update:model', newVal)
            },
            press: function(key) {
                if (!allowedKeys.includes(key)) return
                let newVal = app.utils.sanitizeNumber(`${this.number}${key}`)
                if (newVal) this.$emit('update:model', newVal)
                if (this.mode === 'dtmf') {
                    app.emit('sip:dtmf', {callId: this.call.id, key})
                }
                navigator.vibrate(100)
                app.sounds.beep(5, 750, 50)
            },
            removeLastNumber: function() {
                if (this.callingDisabled) return
                if (this.number) {
                    navigator.vibrate(100)
                    this.$emit('update:model', this.number.substring(0, this.number.length - 1))
                }
            },
            toggleNodeView: function() {
                app.setState({sig11: {
                    network: {view: !this.sig11.network.view}},
                }, {persist: true})
            },
        }, app.helpers.sharedMethods()),
        props: {
            call: {default: null},
            dtmf: {default: false, type: Boolean},
            mode: {default: 'call', type: String},
            number: {default: ''},
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
            number: function(number) {
                if (this.callingDisabled) return
                let cleanedNumber = number
                cleanedNumber = app.utils.sanitizeNumber(number)
                this.$emit('update:model', cleanedNumber)
            },
        },
    }

    return CallKeypad
}
