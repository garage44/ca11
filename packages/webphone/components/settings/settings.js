import v from 'vuelidate/dist/validators.min.js'

export default (app) => {

    const Settings = {
        data: function() {
            return {
                playing: {
                    headsetOutput: false,
                    ringOutput: false,
                    speakerOutput: false,
                },
            }
        },
        methods: Object.assign({
            classes: function(block, modifier) {
                let classes = {}
                if (block === 'tabs') {
                    if (modifier === 'devices' && !this.settings.webrtc.enabled) classes.disabled = true
                    if (modifier === this.tabs.active) classes.active = true
                }
                return classes
            },
            save: function(e) {
                let settings = app.utils.copyObject(this.settings)
                delete settings.webrtc.media

                let settingsState = {
                    app: {dnd: false},
                    language: this.language,
                    settings,
                    sig11: {
                        enabled: app.state.sig11.toggled,
                        endpoint: app.state.sig11.endpoint,
                        identity: app.state.sig11.identity,
                        toggled: app.state.sig11.toggled,
                    },
                    sip: {
                        account: {
                            selected: app.state.sip.account.selected,
                        },
                        enabled: app.state.sip.toggled,
                        endpoint: app.state.sip.endpoint,
                        toggled: app.state.sip.toggled,
                    },
                }

                // Set SIG11 as default call protocol when SIP is disabled.
                if (!this.sip.enabled && app.state.caller.description.protocol === 'sip') {
                    settingsState.caller = {description: {protocol: 'sig11'}}
                }

                app.setState(settingsState, {persist: true})

                // Update the vault settings.
                app.setState({app: {vault: this.app.vault}}, {encrypt: false, persist: true})
                app.notify({icon: 'settings', message: app.$t('your settings are stored'), type: 'success'})

                // Verify currently selected devices after saving settings again.
                app.devices.verifySinks()
                app.emit('ca11:services')
            },
        }, app.helpers.sharedMethods()),
        mounted: async function() {
            // Immediatly trigger validation on the fields.
            this.$v.$touch()
        },
        store: {
            app: 'app',
            devices: 'settings.webrtc.devices',
            language: 'language',
            media: 'settings.webrtc.media',
            settings: 'settings',
            sig11: 'sig11',
            sip: 'sip',
            tabs: 'ui.tabs.settings',
            webhooks: 'settings.webhooks',
        },
        validations: function() {
            let validations = {
                sig11: {
                    endpoint: {
                        requiredIf: v.requiredIf(() => this.sig11.toggled),
                    },
                },
                sip: {
                    account: {
                        password: {
                            requiredIf: v.requiredIf(() => this.sip.toggled),
                        },
                        username: {
                            requiredIf: v.requiredIf(() => this.sip.toggled),
                        },
                    },
                    endpoint: {
                        requiredIf: v.requiredIf(() => this.sip.toggled),
                    },
                },
            }

            return validations
        },
    }

    return Settings
}
