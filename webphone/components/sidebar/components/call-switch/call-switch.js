export default (app) => {

    return {
        computed: app.helpers.sharedComputed(),
        methods: Object.assign({
            activateCall: function(call) {
                const settings = {webrtc: {media: {stream: {[this.stream.type]: {selected: false}}}}}

                app.setState({settings}, {persist: true})
                if (call) {
                    app.emit('caller:call-activate', {
                        callId: call.id,
                        holdInactive: true,
                        unholdActive: false,
                    })
                    app.setState({ui: {layer: 'stream-view'}})
                } else {
                    app.setState({ui: {layer: 'lobby'}}, {encrypt: false, persist: true})
                    app.emit('caller:call-activate', {callId: null})
                }
            },
            callIcon: function(call) {
                if (['answered_elsewhere', 'bye', 'caller_unavailable', 'callee_busy'].includes(call.status)) {
                    return 'call-end'
                } else {
                    if (call.hold.active) return 'call-hold'
                    else return 'call-active'
                }
            },
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
            classes: function(call) {
                let classes = {}
                // A call cannot be selected while there are no other
                // calls and the media-controls are visible.
                if (!this.callsExist && this.stream[this.stream.type].selected) return classes

                classes.active = call.active
                classes[`call-${call.protocol}-${call.number}`] = true
                return classes
            },
            newCallAllowed: function() {
                let allowed = true
                for (let callId of Object.keys(this.calls)) {
                    if (['create', 'invite'].includes(this.calls[callId].status)) {
                        allowed = false
                    }
                }
                return allowed
            },
        }, app.helpers.sharedMethods()),
        store: {
            calls: 'caller.calls',
            description: 'caller.description',
            stream: 'settings.webrtc.media.stream',
            ui: 'ui',
        },
    }
}
