export default (app) => {
    return {
        computed: {
            // If the current call is in transfer mode.
            callCanTerminate: function() {
                if (!['accepted', 'create', 'invite'].includes(this.call.status)) return false
                return true
            },
            // Requires two active sip calls.
            transferDisabled: function() {
                let transferTargets = 0
                for (const call of Object.values(this.calls)) {
                    if (call.protocol === 'sip' && call.status === 'accepted') {
                        transferTargets += 1
                    }
                }
                return transferTargets < 2
            },
        },
        methods: Object.assign({
            callAccept: function(call) {
                app.modules.caller.calls[call.id].acceptInvite()
            },
            callDescription: function(...args) {app.modules.caller.call(...args)},
            callTerminate: function(call) {
                let status = 'bye'
                if (call.status === 'create') status = 'caller_busy'
                app.modules.caller.calls[call.id].terminate()
            },
            classes: function(block) {
                let classes = {}

                if (block === 'dialpad-button') {
                    classes.active = (this.ui.layer === 'dtmf')
                    classes.disabled = this.call.transfer.active
                } else if (block === 'hold-button') {
                    classes.active = this.call.hold.active
                    classes.disabled = this.call.hold.disabled
                } else if (block === 'mute-button') {
                    classes.active = this.call.mute.active
                } else if (block === 'transfer-button') {
                    classes.active = this.call.transfer.active
                    classes.disabled = this.call.transfer.disabled
                }
                return classes
            },
            holdToggle: function() {
                if (this.call.hold.disabled) return
                app.emit('caller:call-hold', {callId: this.call.id})
            },
            keypadToggle: function() {
                // Keypad cannot be active during transfer.
                if (this.call.transfer.active) return

                if (this.ui.layer === 'dtmf') {
                    app.setState({ui: {layer: 'stream-view'}})
                } else {
                    app.setState({ui: {layer: 'dtmf'}})
                }
            },
            muteToggle: function() {
                app.emit('caller:call-mute', {callId: this.call.id})
            },
            transferFinalize: function() {
                app.emit('caller:transfer-finalize', {callId: this.call.id})
            },
            transferToggle: function() {
                if (this.call.transfer.disabled) return
                app.emit('caller:transfer-initialize', {callId: this.call.id})
            },
        }, app.helpers.sharedMethods()),
        props: ['call'],
        store: {
            calls: 'caller.calls',
            description: 'caller.description',
            ui: 'ui',
        },
    }
}
