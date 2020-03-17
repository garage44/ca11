/**
* Phone tone generators.
* based on: http://outputchannel.com/post/recreating-phone-sounds-web-audio/
* @module Sounds
*/

import EventEmitter from 'eventemitter3'


let context

if (globalThis.window) context = new AudioContext()


/**
* Generate a european Busy tone.
*/
class BusyTone {

    constructor(app) {
        if (app.env.isNode) return

        this.app = app
        this.audio = new Audio()
    }

    createRingerLFO() {
        let channels = 1
        let sampleRate = context.sampleRate
        let frameCount = sampleRate * 1
        let arrayBuffer = context.createBuffer(channels, frameCount, sampleRate)
        let bufferData = arrayBuffer.getChannelData(0)
        for (let i = 0; i < frameCount; i++) {
            // Do not use the full amplitude here.
            if ((i / sampleRate > 0 && i / sampleRate < 0.5)) bufferData[i] = 0.5
        }

        return arrayBuffer
    }


    play(sink) {
        if (this.started) return

        this.dest = context.createMediaStreamDestination()
        this.audio.srcObject = this.dest.stream
        this.audio.play()

        if (!sink) {
            const speaker = this.app.state.settings.webrtc.devices.speaker
            if (speaker.enabled) {
                sink = this.app.state.settings.webrtc.devices.sinks.speakerOutput
            } else {
                sink = this.app.state.settings.webrtc.devices.sinks.headsetOutput
            }
        }

        // Chrome Android doesn't have setSinkId.
        if (this.audio.setSinkId) this.audio.setSinkId(sink.id)

        const gainNode = context.createGain()
        gainNode.connect(this.dest)
        this.oscillator = context.createOscillator()
        this.oscillator.connect(gainNode)

        this.oscillator.type = 'sine'
        this.oscillator.frequency.setValueAtTime(450, context.currentTime)
        gainNode.gain.setValueAtTime(0, context.currentTime)

        this.ringerLFOSource = context.createBufferSource()
        this.ringerLFOSource.buffer = this.createRingerLFO()
        this.ringerLFOSource.loop = true
        this.ringerLFOSource.connect(gainNode.gain)
        this.ringerLFOSource.start(0)

        this.oscillator.start()
        this.started = true
    }


    stop() {
        if (this.started) {
            this.oscillator.stop(0)
            this.ringerLFOSource.stop(0)
        }
        this.started = false
    }
}


/**
* Ring-back tone generator for UK and Europe regions.
*/
class RingbackTone {

    constructor(app) {
        if (app.env.isNode) return
        this.app = app
        this.started = false

        this.audio = new Audio()
    }


    createRingerLFO() {
        // Create an empty 3 second mono buffer at the sample rate of the AudioContext.
        let channels = 1
        let frameCount
        let sampleRate = context.sampleRate
        frameCount = sampleRate * 5
        let arrayBuffer = context.createBuffer(channels, frameCount, sampleRate)

        // getChannelData allows us to access and edit
        // the buffer data and change.
        let bufferData = arrayBuffer.getChannelData(0)
        for (let i = 0; i < frameCount; i++) {
            // We want it to be on if the sample lies between 0 and 0.4 seconds,
            // or 0.6 and 1 second.
            if (this.region === 'europe') {
                if ((i / sampleRate > 0 && i / sampleRate < 1)) {
                    bufferData[i] = 0.5
                }
            } else if (this.region === 'uk') {
                if ((i / sampleRate > 0 && i / sampleRate < 0.4) || (i / sampleRate > 0.6 && i / sampleRate < 1.0)) {
                    bufferData[i] = 0.25
                }
            }
        }

        return arrayBuffer
    }


    play(sink) {
        if (this.started) return

        this.dest = context.createMediaStreamDestination()
        this.audio.srcObject = this.dest.stream
        this.audio.play()

        if (!sink) {
            const speaker = this.app.state.settings.webrtc.devices
            if (speaker.enabled) {
                sink = this.app.state.settings.webrtc.devices.sinks.speakerOutput
            } else {
                sink = this.app.state.settings.webrtc.devices.sinks.headsetOutput
            }
        }

        // Chrome Android doesn't have setSinkId.
        if (this.audio.setSinkId) this.audio.setSinkId(sink.id)

        let freq1
        const gainNode = context.createGain()

        freq1 = 425
        this.oscillator = context.createOscillator()
        this.oscillator.type = 'sine'
        this.oscillator.connect(gainNode)
        gainNode.connect(this.dest)
        this.oscillator.connect(gainNode)
        this.oscillator.start(0)
        this.oscillator.frequency.setValueAtTime(freq1, context.currentTime)

        gainNode.gain.setValueAtTime(0, context.currentTime)
        this.ringerLFOSource = context.createBufferSource()
        this.ringerLFOSource.buffer = this.createRingerLFO()
        this.ringerLFOSource.loop = true

        this.ringerLFOSource.connect(gainNode.gain)
        this.ringerLFOSource.start(0)
        this.started = true
    }


    stop() {
        if (!this.started) return
        this.oscillator.stop(0)
        this.ringerLFOSource.stop(0)
        this.started = false
    }
}


/**
* Play a pre-delivered ogg-file as ringtone.
*/
class Sound extends EventEmitter {

    constructor(app, audiofile) {
        super()
        if (app.env.isNode) return
        this.audio = new Audio(audiofile)
        this.app = app
    }


    play({loop = false, sink = null} = {}) {
        this.loop = loop

        if (!this.played) this.audio.addEventListener('ended', this.playEnd.bind(this))
        this.played = true

        if (!sink) sink = this.app.state.settings.webrtc.devices.sinks.ringOutput

        // Chrome Android doesn't have setSinkId.
        if (this.audio.setSinkId) this.audio.setSinkId(sink.id)
        // Loop the sound.
        if (loop) {
            this.audio.addEventListener('ended', () => {
                this.playing = false
            }, false)
        }

        this.audio.play()
        this.playing = true
    }


    playEnd() {
        this.emit('stop')
        this.playing = false

        if (this.loop) {
            this.playing = true
            this.audio.currentTime = 0
            this.audio.play()
        }
    }


    stop() {
        this.audio.pause()
        this.audio.currentTime = 0
        this.playing = false
    }
}


class CallEnd extends Sound {
    constructor(app) {
        super(app, 'static/audio/call-end.ogg')
    }
}


class PowerOn extends Sound {
    constructor(app) {
        super(app, 'static/audio/power-on.ogg')
    }
}

class RingTone extends Sound {
    constructor(app) {
        super(app, 'static/audio/ringtones/default.ogg')
    }

    play(...args) {
        this.audio.src = `static/audio/ringtones/${this.app.state.settings.ringtones.selected.id}.ogg`
        super.play(...args)
    }
}


export default class Sounds {

    constructor(app) {
        this.app = app
        this.context = context

        this.busyTone = new BusyTone(app)
        this.powerOn = new PowerOn(app)
        this.ringbackTone = new RingbackTone(app)
        this.ringTone = new RingTone(app)
        this.callEnd = new CallEnd(app)
    }

    beep(vol, freq, duration) {
        const v = this.context.createOscillator()
        const u = this.context.createGain()
        v.connect(u)
        v.frequency.value = freq
        v.type = 'sine'
        u.connect(this.context.destination)
        u.gain.value = vol * 0.01
        v.start(this.context.currentTime)
        v.stop(this.context.currentTime + duration * 0.001)
    }
}
