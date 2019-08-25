module.exports = (app, shared) => {

    const v = Vuelidate.validators

    const WizardSig11 = {
        computed: app.helpers.sharedComputed(),
        created: function() {
            if (this.sig11.identity.name === '') {
                this.sig11.identity.name = app.state.session.username
            }
            if (this.sig11.identity.number === '') {
                this.sig11.identity.number = this.generatePhonenumber()
            }
        },
        methods: Object.assign({
            generatePhonenumber: function() {
                const min = 1100000000
                const max = 1199999999
                return String(Math.floor(Math.random() * (max - min) + min))
            },
            updateIdentity: function() {
                app.setState({sig11: {identity: this.sig11.identity}}, {persist: true})
                this.stepNext()
            },
        }, shared().methods),

        render: templates.wizard_sig11.r,
        staticRenderFns: templates.wizard_sig11.s,
        store: {
            app: 'app',
            options: 'settings.wizard.steps.options',
            selected: 'settings.wizard.steps.selected',
            sig11: 'sig11',
        },
        validations: function() {
            let validations = {
                sig11: {
                    identity: {
                        name: {
                            minLength: v.minLength(3),
                            required: v.required,
                        },
                        number: {
                            minLength: v.minLength(3),
                            required: v.required,
                        },
                    },
                },
            }

            return validations
        },
    }

    return WizardSig11
}
