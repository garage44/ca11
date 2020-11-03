import Call from './call.js'
import EventEmitter from 'eventemitter3'

import { magicCookie, SipRequest, SipResponse, utils } from './message.js'


class ClientSip extends EventEmitter {

    constructor(options) {
        super()

        this.nc = 0
        this.ncHex = '00000000'
        this.cseq = 1
        this.calls = {}

        // Local tag for out-of-call dialogs.
        this.localTag = utils.token(12)
        this.dialogs = {
            default: {
                callId: utils.token(12),
            },
            options: {to: {tag: null}},
        }
        this.state = 'unregistered'
        Object.assign(this, options)
        this.uri = `sip:${this.domain}`
    }


    connect() {
        console.log("CONNTECT")
        this.socket = new WebSocket(`wss://${this.domain}`, 'sip')
        this.socket.onopen = () => {
            // Triggers a 401 to retrieve a 401 with digest.
            this.register()
        }

        this.socket.onmessage = (e) => {
            let call = null
            const message = this.parseMessage(e.data)
            if (message.context.code === 'PING') return

            if (message.context.method === 'OPTIONS') {
                this.dialogs.options.to.tag = message.context.from.tag
                const context = Object.assign(JSON.parse(JSON.stringify(message.context)), {
                    code: 200,
                    from: {aor: message.context.from.aor, tag: this.dialogs.options.to.tag},
                    host: message.context.via.host,
                    method: 'OPTIONS',
                    to: {aor: message.context.to.aor, tag: this.localTag},
                    via: {
                        alias: true,
                        branch: message.context.via.branch,
                        rport: true,
                    },
                })

                const optionsResponse = new SipResponse(this, context)
                this.socket.send(optionsResponse)
            }

            if (this.calls[message.context.callId]) {
                call = this.calls[message.context.callId]
                call.emit('message', message)
            } else {
                if(message.context.method === 'REGISTER') {
                    if (message.context.status === 'OK') {
                        this.emit('registered')
                    } else if (message.context.status === 'Unauthorized') {
                        this.register(message.context.digest)
                    }
                } else if (message.context.method === 'INVITE') {
                    if (message instanceof SipRequest) {
                        const call = new Call(this, {
                            description: {
                                direction: 'incoming',
                                endpoint: 1000, // message.context.header.From.extension,
                                protocol: 'sip',
                            },
                            id: message.context.callId,
                        })

                        // The dialog's To tag is set here on an incoming call/invite.
                        call.dialogs.invite.to.tag = message.context.from.tag
                        this.calls[call.id] = call
                        // Emit invite up to the SIP module that handles
                        // application state.
                        this.emit('invite', {context: message, handler: call})
                    }
                }
            }
        }

        this.socket.onclose = () => {
            console.log("CLOSED")
        }
    }


    parseMessage(rawSipMessage) {
        let type
        const context = {
            content: '',
        }

        let data = rawSipMessage.trim()
        if (data === '') {
            context.code = 'PING'
            return new SipRequest(this, context)
        }
        data = data.split('\r\n')
        const requestLine = data[0].split(' ')

        if (requestLine[0] === 'SIP/2.0') {
            type = 'response'
            context.code = requestLine[1]
            context.status = requestLine[2]
        } else {
            type = 'request'
            context.status = requestLine[0]
        }
        // Remove the header request/response line.
        data.shift()

        const rawHeaders = {}
        let isHeaderLine = true

        for (const line of data) {
            if (isHeaderLine) {
                const key = line.split(':')[0]
                const value = line.replace(`${key}:`, '').trim()
                rawHeaders[key] = value

                if (key === 'Content-Length') isHeaderLine = false
            } else {
                if (!line) continue
                context.content += `${line}\r\n`
            }
        }

        const to = rawHeaders.To.split(';')
        context.to = {
            aor: to[0].replace('<sip:', '').replace('>', ''),
            raw: to[0],
        }
        if (to[1]) context.to.tag = to[1].split('=')[1]


        const from = rawHeaders.From.split(';')
        context.from = {
            aor: from[0].replace('<sip:', '').replace('>', ''),
            raw: from[0],
        }
        if (from[1]) context.from.tag = from[1].split('=')[1]

        const via = {}

        rawHeaders.Via.split(';')
            .map((i) => {
                if (i.includes('SIP/2.0')) via.host = i.split(' ')[1]
                return i
            })
            .filter(i => i.includes('='))
            .map((i) => i.split('='))
            .forEach((i) => {via[i[0]] = i[1]})

        context.via = via

        if (rawHeaders['WWW-Authenticate']) {
            context.digest = utils.commaSepToObject(rawHeaders['WWW-Authenticate'])
        }

        context.callId = rawHeaders['Call-ID']
        const cseqHeader = rawHeaders['CSeq'].split(' ')
        context.cseq = Number(cseqHeader[0])
        context.method = cseqHeader[1]

        if (type === 'request') return new SipRequest(this, context)
        else return new SipResponse(this, context)
    }


    register(digest) {
        const context = Object.assign({
            cseq: this.cseq,
            method: 'REGISTER',
            via: {branch: `${magicCookie}${utils.token(7)}`},
        }, this.dialogs.default)

        if (digest) context.digest = digest
        const registerRequest = new SipRequest(this, context)
        this.socket.send(registerRequest)
    }

}

export default ClientSip