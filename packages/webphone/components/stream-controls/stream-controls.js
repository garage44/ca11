export default (app) => {
    let recorder, recorderData

    const sharedComputed = app.helpers.sharedComputed()

    return {
        computed: Object.assign({
            callActive: sharedComputed.callActive,
        }),
        data: function() {
            return {
                recording: false,
                types: ['audio', 'video', 'display'],
            }
        },
        methods: {
            callDescription: function(...args) {
                app.modules.caller.call(...args)
            },
            classes: function() {
                const classes = {
                    [this.stream.kind]: true,
                    selected: this.stream.selected,
                }

                if (this.stream.ready) classes[`t-btn-media-stream-${this.stream.kind}`] = true
                return classes
            },
            switchStream: function() {
                // Step through streamTypes.
                const nextStreamType = this.types[(this.types.indexOf(this.stream.kind) + 1) % this.types.length]
                // Maintain selected state between streams.
                app.media.query(nextStreamType, {selected: this.stream.selected})
            },
            toggleFullscreen: function() {
                const mediaElement = this.$refs[this.stream.kind]
                mediaElement.requestFullscreen({navigationUI: 'hide'})
            },
            togglePip: function() {
                const mediaElement = this.$refs[this.stream.kind]
                mediaElement.requestPictureInPicture()
            },
            toggleRecord: function() {
                if (!this.recording) {
                    this.recording = true
                    recorder = new MediaRecorder(app.media.streams[this.stream.id])
                    recorderData = []
                    recorder.ondataavailable = (event) => {
                        recorderData.push(event.data)
                    }

                    recorder.onstop = function() {
                        let recordedBlob = new Blob(recorderData)
                        var audioURL = URL.createObjectURL(recordedBlob)
                        var link = document.createElement('a')
                        link.setAttribute('href', audioURL)
                        link.setAttribute('download', 'recording.webm')
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                    }
                    recorder.start()
                } else {
                    recorder.stop()
                    this.recording = false
                }
            },
        },
        mounted: function() {
            if (this.stream.id) {
                if (!this.$refs[this.stream.kind]) return

                const mediaElement = this.$refs[this.stream.kind]
                mediaElement.srcObject = app.media.streams[this.stream.id]

                if (this.stream.muted) mediaElement.muted = true

                mediaElement.addEventListener('loadeddata', () => {
                    this.stream.ready = true
                })
            }
        },
        props: {
            stream: {
                default: null,
                type: Object,
            },
        },
        store: {
            calls: 'caller.calls',
            description: 'caller.description',
        },
        watch: {
            'stream.id': function(streamId) {
                if (!this.$refs[this.stream.kind]) return
                const mediaElement = this.$refs[this.stream.kind]

                mediaElement.srcObject = app.media.streams[streamId]
                if (this.stream.muted) mediaElement.muted = true

                mediaElement.addEventListener('loadeddata', () => {
                    this.stream.ready = true
                })
            },
        },
    }
}
