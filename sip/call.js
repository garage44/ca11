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
        this.pc = new RTCPeerConnection({
            iceServers: this.client.stun.map((i) => ({urls: i})),
            sdpSemantics:'unified-plan',
        })

        this.pc.ontrack = this.onTrack.bind(this)
        await this.pc.setRemoteDescription({sdp: this.inviteContext.context.content, type: 'offer'})

        for (const track of localStream.getTracks()) {
            this.pc.addTrack(track, localStream)
        }

        const answer = await this.pc.createAnswer()
        await this.pc.setLocalDescription(answer)

        // Incoming call/invite accepted.
        const inviteResponse = new SipResponse(this.client, {
            callId: this.id,
            code: 200,
            content: answer.sdp,
            cseq: this.inviteContext.context.cseq,
            extension: this.description.endpoint,
            from: {tag: this.dialogs.invite.to.tag},
            method: 'INVITE',
            to: {tag: this.localTag},
            via: {branch: this.dialogs.invite.branch},
        })

        this.client.socket.send(inviteResponse)
        this.emit('invite-accepted')
    }


    hold() {
        this.holdModifier = true

        this.holdSdp = this.pc.localDescription.sdp.replace('a=sendrecv', 'a=sendonly')
        const inviteRequest = new SipRequest(this.client, {
            callId: this.id,
            content: this.holdSdp,
            cseq: this.client.cseq,
            extension: this.description.endpoint,
            from: {tag: this.localTag},
            method: 'INVITE',
            via: {branch: `${magicCookie}${utils.token(7)}`},
        })

        this.client.socket.send(inviteRequest)
    }


    async initIncoming({context}) {
        const message = context

        this.inviteContext = message
        this.dialogs.invite.branch = message.context.via.branch
        this.inviteCseq = message.context.cseq

        const tryingResponse = new SipResponse(this.client, {
            callId: this.id,
            code: 100,
            cseq: message.context.cseq,
            extension: this.description.endpoint,
            from: {tag: this.localTag},
            method: 'INVITE',
            via: {branch: this.dialogs.invite.branch},
        })

        const ringingResponse = new SipResponse(this.client, {
            callId: this.id,
            code: 180,
            cseq: message.context.cseq,
            extension: this.description.endpoint,
            from: {tag: this.localTag},
            method: 'INVITE',
            to: {tag: this.dialogs.invite.to.tag},
            via: {branch: this.dialogs.invite.branch},
        })

        this.client.socket.send(tryingResponse)
        this.client.socket.send(ringingResponse)
    }


    async inviteRemote(localStream) {
        this.pc = new RTCPeerConnection({
            iceServers: this.client.stun.map((i) => ({urls: i})),
            sdpSemantics:'unified-plan',
        })

        this.pc.ontrack = this.onTrack.bind(this)
        this.pc.onicegatheringstatechange = () => {
            // Send the invite once the candidates are part of the sdp.
            if (this.pc.iceGatheringState === 'complete') {
                this.client.calls[this.id] = this
                if (this.status !== 'accepted') {
                    const inviteRequest = new SipRequest(this.client, {
                        callId: this.id,
                        content: this.pc.localDescription.sdp,
                        cseq: this.client.cseq,
                        extension: this.description.endpoint,
                        from: {tag: this.localTag},
                        method: 'INVITE',
                        via: {branch: `${magicCookie}${utils.token(7)}`},
                    })

                    this.client.socket.send(inviteRequest)
                }
            }
        }

        for (const track of localStream.getTracks()) {
            this.pc.addTrack(track, localStream)
        }

        const offer = await this.pc.createOffer()
        await this.pc.setLocalDescription(offer)
    }


    keyPress(key) {
        this.client.cseq += 1
        const dtmfRequest = new SipRequest(this.client, {
            callId: this.id,
            content: `Signal= ${key}\r\nDuration= 100\r\n`,
            cseq: this.client.cseq,
            extension: this.description.endpoint,
            from: {tag: this.localTag},
            method: 'INFO',
            to: {tag: this.dialogs.invite.to.tag},
            via: {branch: this.dialogs.invite.branch},
        })

        this.client.socket.send(dtmfRequest)
    }


    async onMessage(message) {
        if (message.context.method === 'INVITE') {

            if (this.status === 'accepted') {
                this.dialogs.invite.branch = message.context.via.branch

                if (message instanceof SipRequest) {
                    // Match stream to ConfBridge.
                    // TODO Match label and stream id with Confbridge stats.
                    for (const media of message.sdp.media) {
                        if (media.label) {
                            const trackId = media.msid.split(' ')[1]
                            this.channelTracks[String(media.label)] = trackId
                        }
                    }

                    await this.pc.setRemoteDescription({sdp: message.context.content, type: 'offer'})
                    const answer = await this.pc.createAnswer()
                    await this.pc.setLocalDescription(answer)

                    // Incoming call/invite accepted.
                    const inviteResponse = new SipResponse(this.client, {
                        callId: this.id,
                        code: 200,
                        content: answer.sdp,
                        cseq: message.context.cseq,
                        digest: this.digest,
                        extension: this.description.endpoint,
                        from: {tag: this.dialogs.invite.to.tag},
                        method: 'INVITE',
                        to: {tag: this.localTag},
                        via: {branch: this.dialogs.invite.branch},
                    })

                    this.client.socket.send(inviteResponse)
                }
            }
            if (message.context.status === 'Unauthorized') {
                this.dialogs.invite.to.tag = message.context.to.tag

                if (message.context.digest) {
                    this.digest = message.context.digest

                    // Initiate an outgoing call with credentials.
                    this.dialogs.invite.branch = `${magicCookie}${utils.token(7)}`
                    const inviteRequest = new SipRequest(this.client, {
                        callId: this.id,
                        content: this.holdModifier ? this.holdSdp : this.pc.localDescription.sdp,
                        cseq: message.context.cseq,
                        digest: message.context.digest,
                        extension: this.description.endpoint,
                        from: {tag: this.localTag},
                        method: 'INVITE',
                        via: {branch: this.dialogs.invite.branch},
                    })

                    const ackRequest = new SipRequest(this.client, {
                        branch: this.dialogs.invite.branch,
                        callId: this.id,
                        cseq: message.context.cseq,
                        extension: this.description.endpoint,
                        from: {tag: this.localTag},
                        method: 'ACK',
                        to: {tag: this.dialogs.invite.to.tag},
                    })

                    this.client.socket.send(ackRequest)
                    this.client.socket.send(inviteRequest)
                }
            } else if (message.context.status === 'OK') {
                this.dialogs.invite.to.tag = message.context.to.tag
                await this.pc.setRemoteDescription({sdp: message.context.content, type: 'answer'})

                // MISSING AORS
                const ackRequest = new SipRequest(this.client, {
                    callId: this.id,
                    cseq: message.context.cseq,
                    extension: this.description.endpoint,
                    from: {tag: this.localTag},
                    method: 'ACK',
                    to: {tag: this.dialogs.invite.to.tag},
                    transport: 'ws',
                    via: {branch: this.dialogs.invite.to.tag},
                })
                this.client.socket.send(ackRequest)
                // Outgoing call accepted;
                this.status = 'accepted'
                this.emit('outgoing-accepted')

            }
        } else if (message.context.method === 'BYE') {
            this.emit('terminate', {callID: this.id})
        } else if (message.context.method === 'MESSAGE') {
            const infoMsg = JSON.parse(message.context.content)

            if (confBridgeEvents[infoMsg.type]) {
                this.isConference = true
                for (const channel of infoMsg.channels) {
                    // Means there is a track for this channel.
                    if (this.channelTracks[channel.id]) {
                        this.emit('track-info', this.channelTracks[channel.id], {
                            action: confBridgeEvents[infoMsg.type],
                            info: {
                                endpoint: channel.caller.number,
                                name: channel.caller.name,
                            },
                        })
                    }
                }
            }

            // MESSAGE response.
            const messageResponse = new SipResponse(this.client, {
                callId: this.id,
                code: 501,
                cseq: message.context.cseq,
                extension: this.description.endpoint,
                from: {raw: message.context.from.raw, tag: message.context.from.tag},
                method: 'MESSAGE',
                to: {aor: message.context.to.aor, tag: message.context.to.tag},
                via: {branch: message.context.via.branch, rport: true},
            })

            this.client.socket.send(messageResponse)

        }
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
        this.client.cseq += 1
        const byeMessage = new SipRequest(this.client, {
            callId: this.id,
            cseq: this.client.cseq,
            extension: this.description.endpoint,
            from: {tag: this.localTag},
            method: 'BYE',
            to: {tag: this.dialogs.invite.to.tag},
            transport: 'ws',
            via: {branch: this.dialogs.invite.branch},
        })
        this.client.socket.send(byeMessage)
    }


    transfer(targetCall) {
        if (typeof targetCall === 'string') {
            this.session.refer(`sip:${targetCall}@ca11.app`)
        } else {
            this.session.refer(targetCall.session)
        }
    }


    unhold() {
        if (this.session) {
            this.session.unhold({
                sessionDescriptionHandlerOptions: {
                    constraints: this.app.media._getUserMediaFlags(),
                },
            })
            this.setState({hold: {active: false}})
        }
    }
}

export default CallSip
