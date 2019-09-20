module.exports = (app, actions) => {
    /**
    * Do-Not-Disturb component.
    * @memberof fg.components
    */
    const Dnd = {
        render: templates.dnd.r,
        staticRenderFns: templates.dnd.s,
        store: {
            description: 'caller.description',
            dnd: 'app.dnd',
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

    return Dnd
}
