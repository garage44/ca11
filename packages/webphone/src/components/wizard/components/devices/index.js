module.exports = (app, shared) => {
    /**
    * @memberof fg.components
    */
    const WizardDevices = {
        // beforeMount: function() {
        //     if (!this.devices.input.length || !this.devices.output.length) {
        //         app.devices.verifySinks()
        //     }
        // },
        computed: Object.assign({
            stepValid: function() {
                return this.media.permission
            },
        }, app.helpers.sharedComputed()),

        methods: Object.assign({
            storeDevices: function() {
                let devices = app.utils.copyObject(this.devices)
                // Persist the the device data.
                app.setState({settings: {webrtc: {devices}}}, {persist: true})
                this.stepNext()
            },
        }, shared().methods),
        mounted: function() {
            app.media.poll()
        },
        render: templates.wizard_devices.r,
        staticRenderFns: templates.wizard_devices.s,
        store: {
            app: 'app',
            devices: 'settings.webrtc.devices',
            media: 'settings.webrtc.media',
            options: 'settings.wizard.steps.options',
            selected: 'settings.wizard.steps.selected',
        },

    }

    return WizardDevices
}
