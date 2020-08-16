class Media {

    constructor(app) {
        this.app = app

        // Plays audio when no video can be shown due to an absent foreground DOM.
        this.fallback = {local: null, remote: null}
        this.streams = {}

        if (!this.app.env.isBrowser) return

        this.__createFallbackMedia()
    }


    __createFallbackMedia() {
        this.fallback.local = document.createElement('video')
        this.fallback.local.setAttribute('id', 'local')
        this.fallback.local.muted = true

        this.fallback.remote = document.createElement('video')
        this.fallback.remote.setAttribute('id', 'remote')

        // Trigger play automatically. This is required for any audio
        // to play during a call.
        this.fallback.local.addEventListener('canplay', () => this.fallback.local.play())
        this.fallback.remote.addEventListener('canplay', () => this.fallback.remote.play())
        document.body.prepend(this.fallback.local)
        document.body.prepend(this.fallback.remote)
    }


    _getUserMediaFlags({video = true} = {}) {
        const presets = {
            AUDIO_NOPROCESSING: {
                audio: {
                    echoCancellation: false,
                    googAudioMirroring: false,
                    googAutoGainControl: false,
                    googAutoGainControl2: false,
                    googEchoCancellation: false,
                    googHighpassFilter: false,
                    googNoiseSuppression: false,
                    googTypingNoiseDetection: false,
                },
                video,
            },
            AUDIO_PROCESSING: {
                audio: {},
                video,
            },
        }

        const userMediaFlags = presets[this.app.state.settings.webrtc.media.type.selected.id]
        const inputSink = this.app.state.settings.webrtc.devices.sinks.headsetInput.id

        if (inputSink && inputSink !== 'default') {
            userMediaFlags.audio.deviceId = inputSink
        }
        return userMediaFlags
    }


    poll() {
        this.app.logger.debug(`media poller started`)
        this.intervalId = setInterval(async() => {
            // Only do this when being authenticated; e.g. when there
            // is an active state container around.
            if (this.app.state.session.authenticated) {
                try {
                    const stream = await this.query()
                    if (!this.app.devices.cached) await this.app.devices.verifySinks()

                    // Disable this poller as soon we got permission.
                    if (stream) {
                        this.app.logger.debug(`media poller stopped (approved)`)
                        clearInterval(this.intervalId)
                    }
                } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error(err)
                    this.app.logger.debug(`media poller stopped (exception: ${err})`)
                    // An exception means something else than a lack of permission.
                    clearInterval(this.intervalId)
                }
            }
        }, 500)
    }


    /**
    * Query for an audio, video or display stream.
    * @param {String} type - The type of media to acquire.
    * @returns {MediaStream} - When succesfully requested a stream; null otherwise.
    */
    async query(type = null) {
        if (this.app.env.isNode) return null
        if (!type) type = this.app.state.settings.webrtc.media.stream.type

        const streamId = this.app.state.settings.webrtc.media.stream[type].id
        // Reuse an existing stream.
        let stream = this.streams[streamId]

        if (!stream) {
            this.app.logger.info(`aqcuiring stream type: ${type}`)
            try {
                const flags = this._getUserMediaFlags({audio: true, video: type === 'video' ? true : false})
                const userMedia = await navigator.mediaDevices.getUserMedia(flags)

                if (type === 'display') {
                    // getDisplayMedia in Chrome doesn't support audio yet; add the audiotrack from
                    // userMedia to the MediaStream so Asterisk won't panic.
                    let audio = await userMedia.getAudioTracks()[0]
                    stream = await navigator.mediaDevices.getDisplayMedia({audio: false, video: true})
                    for (const track of stream.getTracks()) {
                        track.onended = () => {
                            const stateStream = {display: {id: null}}
                            // Unset the stream id.
                            this.app.setState({settings: {webrtc: {media: {stream: stateStream}}}})

                            // Switch to audio type when the display stream is current selected.
                            type = this.app.state.settings.webrtc.media.stream.type
                            if (type === 'display') this.query('audio')
                        }
                    }

                    stream.addTrack(audio)
                } else {
                    stream = userMedia
                }
            } catch (err) {
                // There are no devices at all. Spawn a warning.
                if (err.message === 'Requested device not found') {
                    // eslint-disable-next-line no-console
                    console.error(err)
                    this.app.notify({icon: 'warning', message: `${this.app.$t('no suitable device found for:')} ${type}`, type: 'warning'})

                    this.app.setState({settings: {webrtc: {media: {
                        permission: true,
                        stream: {
                            type,
                        },
                    }}}}, {persist: true})

                    return null
                }

                // This error also may be triggered when there are no devices
                // at all. The browser sometimes has issues finding any devices.
                this.app.setState({settings: {webrtc: {media: {permission: false}}}})
            }
        }

        if (!stream) return null

        this.streams[stream.id] = stream
        this.app.setState({settings: {webrtc: {media: {
            permission: true,
            stream: {type},
        }}}}, {persist: true})
        // (!) The stream id is never persisted; there is stream
        // initialization logic that relies on the absence of the id.
        this.app.setState({settings: {webrtc: {media: {
            stream: {[type]: {id: stream.id, muted: true}},
        }}}})
        return stream
    }


    stop() {
        for (const [streamId, stream] of Object.entries(this.streams)) {
            for (const track of stream.getTracks()) {
                track.stop()
            }
            delete this.streams[streamId]
        }
    }
}

export default Media
