import { copyObject } from '/webphone/lib/utils.js'
import v from 'vuelidate/dist/validators.min.js'

export default (app) => {

    return {
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
                    if (modifier === this.tabs.active) classes.active = true
                } else if (block === 'subtabs') {
                    const subtabs = this.tabs.subtabs[this.tabs.active]
                    if (subtabs && subtabs.active === modifier) {
                        classes.active = true
                    }
                }
                return classes
            },
            save: function() {
                let settings = copyObject(this.settings)
                delete settings.webrtc.media

                let settingsState = {
                    app: {dnd: false},
                    ion: {
                        enabled: app.state.ion.enabled,
                    },
                    language: this.language,
                    settings,
                    sig11: {
                        domain: app.state.sig11.domain,
                        enabled: app.state.sig11.toggled,
                        identity: app.state.sig11.identity,
                        toggled: app.state.sig11.toggled,
                    },
                    sip: {
                        domain: app.state.sip.domain,
                        enabled: app.state.sip.toggled,
                        identity: app.state.sip.identity,
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
            ion: 'ion',
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
                    domain: {requiredIf: v.requiredIf(() => this.sig11.toggled)},
                },
                sip: {
                    domain: {requiredIf: v.requiredIf(() => this.sip.toggled)},
                    identity: {
                        endpoint: {requiredIf: v.requiredIf(() => this.sip.toggled)},
                        password: {requiredIf: v.requiredIf(() => this.sip.toggled)},
                    },
                },
            }

            return validations
        },
    }
}
