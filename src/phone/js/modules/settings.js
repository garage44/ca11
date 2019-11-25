/**
* This module takes care of dealing with all
* settings and responding to changes to it.
* @module ModuleSettings
*/
class PluginSettings extends Plugin {
    /**
    * Initializes the module's store.
    * All application runtime settings are defined here. Build-time
    * settings go in the ``~/.ca11rc` file.
    * @returns {Object} The module's store properties.
    */
    _initialState() {
        let state = {
            ringtones: {
                options: [
                    {id: 'default', name: 'default'},
                    {id: 'ringtone-1', name: 'ringtone-1'},
                    {id: 'ringtone-2', name: 'ringtone-2'},
                    {id: 'ringtone-3', name: 'ringtone-3'},
                    {id: 'ringtone-4', name: 'ringtone-4'},
                    {id: 'ringtone-5', name: 'ringtone-5'},
                ],
                selected: {id: 'default', name: 'default'},
            },
            telemetry: {
                enabled: false,
                sentryDsn: process.env.SENTRY_DSN,
            },
            webhooks: {
                enabled: false,
                url: '',
            },
            webrtc: {
                devices: {
                    input: [],
                    output: [],
                    ready: true,
                    sinks: {
                        headsetInput: {id: 'default', name: this.app.$t('default').ca()},
                        headsetOutput: {id: 'default', name: this.app.$t('default').ca()},
                        ringOutput: {id: 'default', name: this.app.$t('default').ca()},
                        speakerInput: {id: 'default', name: this.app.$t('default').ca()},
                        speakerOutput: {id: 'default', name: this.app.$t('default').ca()},
                    },
                    speaker: {
                        enabled: false,
                    },
                },
                enabled: true,
                media: {
                    permission: true,
                    stream: {
                        audio: {
                            id: null,
                            kind: 'audio',
                            local: true,
                            muted: false,
                            ready: false,
                            selected: true,
                        },
                        display: {
                            id: null,
                            kind: 'display',
                            local: true,
                            muted: false,
                            ready: false,
                            selected: true,
                        },
                        type: 'video', // Switch between audio, display and video stream.
                        video: {
                            id: null,
                            kind: 'video',
                            local: true,
                            muted: false,
                            ready: false,
                            selected: false,
                        },
                    },
                    type: {
                        options: [
                            {id: 'AUDIO_NOPROCESSING', name: this.app.$t('disabled')},
                            {id: 'AUDIO_PROCESSING', name: this.app.$t('enabled')},
                        ],
                        selected: {id: 'AUDIO_NOPROCESSING', name: this.app.$t('disabled')},
                    },
                },
                stun: process.env.STUN,
                toggle: true,
            },
            wizard: {
                completed: true,
                steps: {
                    options: [
                        {name: 'WizardSig11'},
                        {name: 'WizardClickToDial'},
                        {name: 'WizardDevices'},
                        {name: 'WizardTelemetry'},
                    ],
                    selected: {name: 'WizardSig11'},
                },
            },
        }

        return state
    }


    /**
    * Refresh the devices list when this plugin is started, but
    * only if the Vault is unlocked, because the devices list is
    * stored in the encrypted part of the store, which should be
    * available at that point. An additional vault unlock watcher
    * is used to refresh the devices list when auto unlocking is
    * disabled.
    */
    _ready() {
        if (!this.app.state.settings.telemetry.enabled) {
            Raven.uninstall()
            return
        }

        const release = process.env.VERSION + '-' + this.app.env.name
        this.app.logger.info(`${this}monitoring exceptions for release ${release}`)
        Raven.config(process.env.SENTRY_DSN, {
            allowSecretKey: true,
            environment: 'production',
            release,
            tags: {
                sipjs: SIP.version,
                vuejs: Vue.version,
            },
        }).install()

        Raven.setUserContext({
            email: this.app.state.session.username,
            id: this.app.state.session.id,
        })
    }


    /**
    * Respond to changes in settings, like storing the Vault key,
    * toggle the Click-to-dial icon observer, etc..
    * @returns {Object} The store properties to watch.
    */
    _watchers() {
        return {
            'store.settings.telemetry.enabled': (enabled) => {
                this.app.logger.info(`${this}switching sentry exception monitoring ${enabled ? 'on' : 'off'}`)
                if (enabled) {
                    const sentryDsn = this.app.state.settings.telemetry.sentryDsn
                    Raven.config(sentryDsn, {
                        allowSecretKey: true,
                        environment: 'production',
                        release: this.app.state.app.version.current,
                    }).install()
                } else {
                    this.app.logger.info(`${this}stop raven exception monitoring`)
                    Raven.uninstall()
                }
            },
            /**
            * The default value is true.
            * @param {Boolean} enabled - Permission granted?
            */
            'store.settings.webrtc.media.permission': (enabled) => {
                if (enabled) {
                    this.app.devices.verifySinks()
                }
            },
        }
    }


    /**
    * Generate a representational name for this module. Used for logging.
    * @returns {String} - An identifier for this module.
    */
    toString() {
        return `${this.app}[settings] `
    }
}

module.exports = PluginSettings
