import EventEmitter from 'eventemitter3'

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


class CallIon extends EventEmitter {

    constructor(client, {description, id}) {
        super()

        this.description = description
        this.id = id
        this.client = client
        this.tracks = {}
        this.on('message', this.onMessage.bind(this))
    }


    async inviteRemote(localStream) {
        this.pc = new RTCPeerConnection({
            iceServers: [{
                urls: this.client.config.stun,
            }],
        })

        this.pc.ontrack = this.onTrack.bind(this)
        this.pc.onicegatheringstatechange = () => {
            if (this.pc.iceGatheringState === 'complete') {
                console.log("COMPLETE")
            }
        }

        this.pc.onicecandidate = event => {
            if (event.candidate !== null) {
                this.client.socket.send(JSON.stringify({
                    id: this.id,
                    method: 'trickle',
                    params: {
                        candidate: event.candidate,
                    },
                }))
            }
        }

        for (const track of localStream.getTracks()) {
            this.pc.addTrack(track, localStream)
        }

        const offer = await this.pc.createOffer()
        await this.pc.setLocalDescription(offer)

        this.client.socket.send(JSON.stringify({
            id: this.id,
            method: 'join',
            params: {
                offer: this.pc.localDescription,
                sid: this.description.endpoint,
            },
        }))
    }

    async onMessage(message) {
        this.pc.onnegotiationneeded = async() => {
            console.log('Renegotiating')
            const offer = await this.pc.createOffer()
            await this.pc.setLocalDescription(offer)
            this.client.socket.send(JSON.stringify({
                id: this.id,
                method: 'offer',
                params: { desc: offer },
            }))
        }

        this.pc.setRemoteDescription(message.result)
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
        this.emit('terminate', {callID: this.id})
    }
}

export default CallIon
