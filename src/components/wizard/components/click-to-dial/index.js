module.exports = (app, shared) => {
    /**
    * @memberof fg.components
    */
    const ClickToDial = {
        computed: app.helpers.sharedComputed(),
        methods: Object.assign({
            triggerProtocolHandler: function() {
                if (navigator.unregisterProtocolHandler) navigator.unregisterProtocolHandler('tel', `${document.location.origin}/?%s`, 'CA11')
                navigator.registerProtocolHandler('tel', `${document.location.origin}/?%s`, 'CA11')
            },
        }, shared().methods),
        render: templates.wizard_click_to_dial.r,
        staticRenderFns: templates.wizard_click_to_dial.s,
        store: {
            app: 'app',
            options: 'settings.wizard.steps.options',
            selected: 'settings.wizard.steps.selected',
        },
    }

    return ClickToDial
}
