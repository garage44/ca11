import EventEmitter from 'eventemitter3'
import md5 from 'blueimp-md5'
import Protocol from './lib/protocol.js'
import Call from './lib/call.js'



class SipClient extends EventEmitter {

    constructor(options) {
        super()

        this.state = 'unregistered'
        Object.assign(this, options)

        this.uri = `sip:${this.endpoint}`
        this.protocol = new Protocol()
        this.registerCount = 0
    }


    connect() {
        this.socket = new WebSocket(`wss://${this.endpoint}`, 'sip')

        this.socket.onopen = () => {
            // Trigger a 401 with the digest, so we can authenticate.
            this.register()
        }

        this.socket.onmessage = (e) => {
            const message = this.protocol.in(e.data, 'incoming')

            if (message.code === '401' && this.registerCount === 0) {
                this.registerCount += 1
                this.register(message.digest)
            }
        }

        this.socket.onclose = () => {
            this.logger.info(`${this}socket closed`)
        }
    }


    generateToken(tokenSize = 12) {
        let token = ''
        for (let i = 0; i < tokenSize; i++) {
            token += Math.floor(Math.random() * 10) + 1
        }
        return token
    }


    async invite(extension, localStream) {
        let message = ''
        message += `INVITE ${extension}@${this.endpoint} SIP/2.0\r\n`
        message += 'Via: SIP/2.0/WSS b55dhqu9asr5.invalid;branch=z9hG4bK1114145\r\n'
        message += `To: <sip:${extension}@sip.dev.ca11.app>\r\n`
        message += `From: <sip:${this.user}@${this.endpoint}>;tag=qcjf8jrqf3\r\n`
        message += 'CSeq: 1198 INVITE\r\n'
        message += 'Call-ID: smnsh62lctqj0j0htccb3m\r\n'
        message += 'Max-Forwards: 70\n'
        message += 'Contact: <sip:g2ubil85@b55dhqu9asr5.invalid;transport=ws>;expires=600\r\n'
        message += 'Allow: ACK,CANCEL,INVITE,MESSAGE,BYE,OPTIONS,INFO,NOTIFY,REFER\r\n'
        message += 'Supported: outbound, path, gruu\r\n'
        message += 'User-Agent: CA11/1.0.0 (Linux/Chrome) ca11\r\n'

        this.pc = new RTCPeerConnection({
            iceServers: this.stun.map((i) => ({urls: i})),
        })


        for (const track of localStream.getTracks()) {
            this.pc.addTrack(track, localStream)
        }


        const offer = await this.pc.createOffer()
        this.pc.setLocalDescription(offer)

        message += `Content-Length: ${this.pc.localDescription.sdp.length}\r\n\r\n`
        message += `${this.pc.localDescription.sdp}\r\n`

        console.log("OFFER", offer)

        this.socket.send(message)

        // Triggers ICE negotiation.

    }


    register(digest = null) {
        this.cnonce = this.generateToken(12)
        this.nc = 1
        this.ncHex = '00000001'

        let message = ''
        message += `REGISTER ${this.uri} SIP/2.0\r\n`
        message += 'Via: SIP/2.0/WSS b55dhqu9asr5.invalid;branch=z9hG4bK1114145\r\n'
        message += `To: <sip:${this.user}@sip.dev.ca11.app>\r\n`
        message += `From: <sip:${this.user}@sip.dev.ca11.app>;tag=qcjf8jrqf3\r\n`
        message += 'CSeq: 1198 REGISTER\r\n'
        message += 'Call-ID: smnsh62lctqj0j0htccb3m\r\n'
        message += 'Max-Forwards: 70\n'
        message += 'Contact: <sip:g2ubil85@b55dhqu9asr5.invalid;transport=ws>;expires=600\r\n'
        message += 'Allow: ACK,CANCEL,INVITE,MESSAGE,BYE,OPTIONS,INFO,NOTIFY,REFER\r\n'
        message += 'Supported: outbound, path, gruu\r\n'
        message += 'User-Agent: CA11/1.0.0 (Linux/Chrome) ca11\r\n'

        if (digest) {
            const hash1 = md5(`${this.user}:${digest['Digest realm']}:${this.password}`)
            const hash2 = md5(`REGISTER:${this.uri}`)
            const response = md5(`${hash1}:${digest.nonce}:${this.ncHex}:${this.cnonce}:auth:${hash2}`)
            message += `Authorization: Digest algorithm=MD5, username="${this.user}", realm="${digest['Digest realm']}", nonce="${digest.nonce}", uri="${this.uri}", response="${response}", opaque="${digest.opaque}", qop=auth, cnonce="${this.cnonce}", nc=${this.ncHex}\r\n`
        }

        message += 'Content-Length: 0\r\n\r\n'
        this.socket.send(message)

        if (digest) {
            this.emit('registered')

        }

    }
}

export default SipClient