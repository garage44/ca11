/**
* This module takes care of dealing with all
* settings and responding to changes to it.
* @module ModuleSettings
*/
class ModuleSettings extends Module {
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
        const release = process.env.VERSION + '-' + this.app.env.name
        this.app.logger.info(`${this}monitoring exceptions for release ${release}`)
    }


    /**
    * Respond to changes in settings, like storing the Vault key,
    * toggle the Click-to-dial icon observer, etc..
    * @returns {Object} The store properties to watch.
    */
    _watchers() {
        return {
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

module.exports = ModuleSettings
