import EventEmitter from 'eventemitter3'
import Protocol from './lib/protocol.js'


class ClientSip extends EventEmitter {

    constructor(options) {
        super()

        this.calls = {}
        this.state = 'unregistered'
        Object.assign(this, options)

        this.uri = `sip:${this.endpoint}`
        this.protocol = new Protocol(this)
        this.contactName = this.protocol.generateToken(8)
    }


    connect() {
        this.socket = new WebSocket(`wss://${this.endpoint}`, 'sip')

        this.socket.onopen = () => {
            // Trigger a 401 with the digest, so we can authenticate.
            this.register()
        }

        this.socket.onmessage = (e) => {
            let call = null
            const message = this.protocol.incoming(e.data)

            if (message.method === 'OPTIONS') {
                this.options(message)
            }

            if (this.calls[message.header['Call-ID']]) {
                call = this.calls[message.header['Call-ID']]
                call.emit('message', message)
            }

            if(message.method === 'REGISTER') {
                if (message.status === 'OK') {
                    this.emit('registered')
                } else if (message.status === 'Unauthorized') {
                    this.register(message.digest)
                }
            }
        }

        this.socket.onclose = () => {
            console.log("CLOSED")
        }
    }


    invite(call) {
        // Associate call object using the Call-ID header line.
        this.calls[call.id] = call

        const message = this.protocol.outgoing({
            callId: call.id,
            content: call.pc.localDescription.sdp,
            extension: call.description.endpoint,
            method: 'INVITE',
        })

        this.socket.send(message)
    }


    options(optionsMessage) {
        console.log("OPTIONS", optionsMessage)
        const message = this.protocol.outgoing({
            branch: optionsMessage.header.Via.branch,
            fromTag: optionsMessage.header.From.tag,
            method: 'OPTIONS',
            toTag: optionsMessage.fromTag,
        })

        message.cseq = optionsMessage.cseq
        message.callId = optionsMessage.callId

        this.socket.send(message)
    }


    register(digest = null) {
        if (!this.callId) this.callId = this.protocol.generateToken(12)
        const message = this.protocol.outgoing({
            digest,
            method: 'REGISTER',
        })

        this.socket.send(message)
    }
}

export default ClientSip