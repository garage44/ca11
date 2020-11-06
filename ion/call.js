import EventEmitter from 'eventemitter3'
import { magicCookie, SipRequest, SipResponse, utils } from './message.js'

// Asterisk ConfBridge MESSAGE events.
const confBridgeEvents = {
    ConfbridgeJoin: 'join',
    ConfbridgeLeave: 'leave',
    ConfbridgeWelcome: 'enter',
}

class CallSip extends EventEmitter {

    constructor(client, {description, id}) {
        super()
        this.client = client
        this.tracks = {}
        this.isConference = false
        // Map Confbridge channels to track ids.
        this.channelTracks = {}

        // Keep track of multiple dialogs.
        this.dialogs = {
            invite: {branch: utils.token(12), to: {tag: null}},
            options: {to: {tag: null}},
        }
        this.holdModifier = false
        this.localTag = utils.token(12)

        this.id = id
        this.description = description
        this.on('message', this.onMessage.bind(this))
    }


    async acceptCall(localStream) {
        console.log("ACCEPT CALL", localStream)
    }


    onTrack(rtcTrackEvent) {
        const track = rtcTrackEvent.receiver.track
        this.tracks[track.id] = track

        track.onended = () => {
            this.emit('track-ended', track)
            delete this.tracks[track.id]
        }
        this.emit('track', track)
    }


    terminate() {
        console.log("TERMINATE")
    }
}

export default CallSip
