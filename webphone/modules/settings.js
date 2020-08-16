import Module from '../lib/module.js'

const streamInfo = {
    id: null,
    info: {endpoint: '', name: ''},
    local: true,
    muted: false,
    ready: false,
    selected: true,
}

class ModuleSettings extends Module {

    state() {
        let state = {init: {}}
        state.init = {
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
                        audio: {kind: 'audio'},
                        display: {kind: 'display'},
                        type: 'audio',
                        video: {kind: 'video'},
                    },
                    type: {
                        options: [
                            {id: 'AUDIO_NOPROCESSING', name: this.app.$t('disabled')},
                            {id: 'AUDIO_PROCESSING', name: this.app.$t('enabled')},
                        ],
                        selected: {id: 'AUDIO_NOPROCESSING', name: this.app.$t('disabled')},
                    },
                },
                stun: globalThis.env.domains.stun,
                toggle: true,
            },
        }

        Object.assign(state.init.webrtc.media.stream.audio, streamInfo)
        Object.assign(state.init.webrtc.media.stream.display, streamInfo)
        Object.assign(state.init.webrtc.media.stream.video, streamInfo)

        return state
    }


    vmWatchers() {
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
}

export default ModuleSettings
