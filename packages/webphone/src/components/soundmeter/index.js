module.exports = (app) => {

    const audioContext = new AudioContext()

    let meter = null
    let volumeLib = require('./lib')
    let canvasContext, canvasElement
    /**
    * @memberof fg.components
    */
    const Soundmeter = {
        destroyed: function() {
            // Stop the volume meter.
            window.cancelAnimationFrame(this.rafID)
        },
        methods: Object.assign({
            drawLoop: function(time) {
                // Clear the background.
                canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height)
                if (meter.checkClipping()) {
                    canvasContext.fillStyle = '#dc4b4b'
                } else {
                    canvasContext.fillStyle = '#9ddc4b'
                }

                canvasContext.fillRect(0, 0, meter.volume * canvasElement.width * 2.4, canvasElement.height)
                this.rafID = window.requestAnimationFrame(this.drawLoop)
            },
            updateSoundmeter: async function() {
                const stream = app.media.streams[this.stream.id]
                const mediaStreamSource = audioContext.createMediaStreamSource(stream)
                meter = volumeLib.createAudioMeter(audioContext)
                mediaStreamSource.connect(meter)
            },
        }, app.helpers.sharedMethods()),
        mounted: async function() {
            canvasElement = this.$refs.meter
            canvasContext = canvasElement.getContext('2d')
            try {
                const stream = app.media.streams[this.stream.id]
                const mediaStreamSource = audioContext.createMediaStreamSource(stream)
                meter = volumeLib.createAudioMeter(audioContext)
                mediaStreamSource.connect(meter)
                this.drawLoop()

            } catch (err) {
                // eslint-disable-next-line no-console
                console.error(err)
                app.setState({settings: {webrtc: {media: {permission: false}}}})
            }
        },
        props: ['stream'],
        render: templates.soundmeter.r,
        staticRenderFns: templates.soundmeter.s,
        store: {
            devices: 'settings.webrtc.devices',
            settings: 'settings',
        },
        watch: {
            'devices.ready': async function(isReady) {
                if (isReady) this.updateSoundmeter()
            },
            /**
            * Reinitialize the soundmeter when the
            * input device changes.
            */
            'devices.sinks.headsetInput.id': async function() {
                this.updateSoundmeter()
            },
        },
    }

    return Soundmeter
}
