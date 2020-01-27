module.exports = (app) => {
    /**
    * @memberof fg.components
    */
    const CallInputEndpoint = {
        methods: {
            removeLastChar: function() {
                this.description.endpoint = this.description.endpoint.substring(0, this.description.endpoint.length - 1)
            },
        },

        render: templates.call_input_endpoint.r,
        staticRenderFns: templates.call_input_endpoint.s,
        store: {
            description: 'caller.description',
        },
        watch: {
            'description.endpoint': () => {
                app.sounds.beep(5, 750, 50)
            },
        },
    }

    return CallInputEndpoint
}
