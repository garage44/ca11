import Module from '../lib/module.js'

/**
* This module takes care of dealing with all
* settings and responding to changes to it.
* @module ModuleSettings
*/
class ModuleSettings extends Module {

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
                        type: 'audio', // Switch between audio, display and video stream.
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
                stun: globalThis.env.endpoints.stun,
                toggle: true,
            },
        }

        return state
    }


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


    toString() {
        return `${this.app}[mod-settings] `
    }
}

export default ModuleSettings
