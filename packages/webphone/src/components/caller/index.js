module.exports = (app) => {
    app.components.CallerSwitcher = Vue.component('CallerSwitcher', require('./components/switcher')(app))
    app.components.CallerBar = Vue.component('CallerBar', require('./components/bar')(app))

    let types = ['audio', 'video', 'display']
    /**
    * @memberof fg.components
    */
    const Caller = {
        computed: Object.assign({
            protocols: function() {
                let protocols = [
                    {disabled: !this.sig11.enabled, name: 'sig11', value: 'sig11'},
                    {disabled: !this.sip.enabled, name: 'sip', value: 'sip'},
                ]
                return protocols
            },
        }, app.helpers.sharedComputed()),
        methods: Object.assign({
            callDescription: function(...args) {
                app.modules.caller.call(...args)
            },
            classes: function(block) {
                let classes = {}
                if (block === 'component') {
                    if (this.callOngoing) classes['t-st-caller-ongoing'] = true
                    else classes['t-st-caller-idle'] = true
                }
                return classes
            },
            switchStream: function() {
                // Step through streamTypes.
                const nextStreamType = types[(types.indexOf(this.stream.type) + 1) % types.length]
                // Maintain selected state between streams.
                app.media.query(nextStreamType, {selected: this.stream.selected})
            },
        }, app.helpers.sharedMethods()),
        render: templates.caller.r,
        staticRenderFns: templates.caller.s,
        store: {
            calls: 'caller.calls',
            description: 'caller.description',
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

    return Caller
}
