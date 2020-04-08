export default (app) => {

    return {
        data: function() {
            return {
                recording: false,
                showType: true,
                types: ['audio', 'video', 'display'],
            }
        },
        methods: {
            classes: function() {
                const classes = {
                    [this.stream.kind]: true,
                    selected: this.stream.selected,
                }

                if (this.stream.ready) classes[`t-btn-media-stream-${this.stream.kind}`] = true
                return classes
            },
            hideStreamTypeIndicator: function() {
                if (this.stream.kind !== 'audio') {
                    window.setTimeout(() => {
                        this.showType = false
                    }, 1500)
                }
            },
            switchStream: function() {
                // Step through streamTypes.
                const nextStreamType = this.types[(this.types.indexOf(this.stream.kind) + 1) % this.types.length]
                // Maintain selected state between streams.
                app.media.query(nextStreamType, {selected: this.stream.selected})
            },
        },
        mounted: function() {
            if (this.stream.id) {
                if (!this.$refs[this.stream.kind]) return

                const mediaElement = this.$refs[this.stream.kind]
                mediaElement.srcObject = app.media.streams[this.stream.id]

                if (this.stream.muted) mediaElement.muted = true

                mediaElement.addEventListener('loadeddata', () => {
                    this.hideStreamTypeIndicator()
                    this.stream.ready = true
                })
            }
        },
        props: {
            controls: {
                default: true,
                type: Boolean,
            },
            stream: {
                default: null,
                type: Object,
            },
        },
        watch: {
            'stream.id': function(streamId) {
                this.showType = true

                if (!this.$refs[this.stream.kind]) return
                const mediaElement = this.$refs[this.stream.kind]

                mediaElement.srcObject = app.media.streams[streamId]
                if (this.stream.muted) mediaElement.muted = true



                mediaElement.addEventListener('loadeddata', () => {
                    this.stream.ready = true
                    this.hideStreamTypeIndicator()
                })
            },
        },
    }
}
