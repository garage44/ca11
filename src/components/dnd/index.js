module.exports = (app, actions) => {
    /**
    * Do-Not-Disturb component.
    * @memberof fg.components
    */
    const Dnd = {
        render: templates.dnd.r,
        staticRenderFns: templates.dnd.s,
        store: {
            dnd: 'app.dnd',
        },
        watch: {
            dnd: function(dnd) {
                app.setState({app: {dnd}}, {persist: true})
            },
        },
    }

    return Dnd
}
