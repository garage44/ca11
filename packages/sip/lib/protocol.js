import md5 from 'blueimp-md5'

const magicCookie = 'z9hG4bK'
const hops = 70

class SipMessage {

    constructor(protocol) {
        this.content = ''
        this.header = {}
        this.fromTag = 'qcjf8jrqf3'
        this.protocol = protocol
    }


    parseIncoming(data) {
        data = data.trim()
        this.type = 'incoming'

        if (data === '') {
            this.code = 'PING'
            return
        }
        const lines = data.split('\r\n')
        const requestLine = lines[0].split(' ')

        if (requestLine[0] === 'SIP/2.0') {
            // SIP/2.0 401 Unauthorized
            this.code = requestLine[1]
            this.status = requestLine[2]
        } else {
            // OPTIONS sip:g2ubil85@127.0.0.1:52584;transport=WS SIP/2.0
            this.status = requestLine[0]
        }

        lines.shift()

        let isHeaderLine = true

        for (const line of lines) {
            if (isHeaderLine) {
                const key = line.split(':')[0]
                const value = line.replace(`${key}:`, '').trim()
                this.header[key] = value

                if (key === 'Content-Length') {
                    isHeaderLine = false
                }
            } else {
                if (line === '') continue
                // TODO: Add sdp parser.
                this.content += `${line}\r\n`
            }
        }

        const to = this.header.To.split(';')
        this.header.To = {}
        this.header.To.address = to[0]
        // Tag from To/From and Call-ID define a Dialog.
        if (to[1]) this.header.To.tag = to[1].split('=')[1]

        const from = this.header.From.split(';')
        this.header.From = {}
        this.header.From.address = from[0]
        if (from[1]) this.header.From.tag = from[1].split('=')[1]

        // SIP/2.0/WS 127.0.0.1:8088;rport;branch=z9hG4bKPj1b871699-11cc-4ae1-b4f0-08a4d29a81fa;alias
        const via = this.header.Via.split(';')
        this.header.Via = {}

        const branch = via.find((i) => i.includes('branch'))
        if (branch) this.header.Via.branch = branch.split('=')[1]

        if (this.header['WWW-Authenticate']) {
            this.digest = this.protocol.commaSepToObject(this.header['WWW-Authenticate'])
        }

        if (this.header['Call-ID']) {
            this.callId = this.header['Call-ID']
        }

        const cseqHeader = this.header['CSeq'].split(' ')
        this.cseq = Number(cseqHeader[0])
        this.method = cseqHeader[1]
    }


    parseOutgoing(options) {
        this.type = 'outgoing'
        Object.assign(this, options)
    }


    toString() {
        if (this.type === 'outgoing') {
            let message = ''
            if (this.method === 'ACK') {
                if (this.transport) {
                    message += `${this.method} sip:${this.protocol.client.endpoint};transport=${this.transport} SIP/2.0\r\n`
                } else {
                    message += `${this.method} sip:${this.extension}@${this.protocol.client.endpoint} SIP/2.0\r\n`
                }
                message += `Via: SIP/2.0/WSS b55dhqu9asr5.invalid;branch=${magicCookie}1114145\r\n`
                message += `To: <sip:${this.extension}@sip.dev.ca11.app>\r\n`
                message += `From: <sip:${this.protocol.client.user}@${this.protocol.client.endpoint}>;tag=${this.fromTag}\r\n`
                message += `Call-ID: ${this.callId}\r\n`
                message += `CSeq: ${this.cseq} ${this.method}\r\n`
                message += `Max-Forwards: ${hops}\n`
            } else if (this.method === 'BYE') {
                message += `${this.method} sip:${this.protocol.client.endpoint};transport=ws SIP/2.0\r\n`
                message += `From: <sip:${this.protocol.client.user}@${this.protocol.client.endpoint}>;tag=${this.fromTag}\r\n`
                message += `To: <sip:${this.extension}@sip.dev.ca11.app>;tag=${this.toTag}\r\n`
                message += `Via: SIP/2.0/WSS b55dhqu9asr5.invalid;branch=${magicCookie}1114145\r\n`
                message += `CSeq: ${this.cseq} ${this.method}\r\n`
                message += `Call-ID: ${this.callId}\r\n`
                message += `Max-Forwards: ${hops}\n`
                message += `Supported: outbound\r\n`
                message += `User-Agent: CA11/undefined (Linux/Chrome) ca11\r\n`
            }


            else if (this.method === 'INVITE') {
                message += `${this.method} sip:${this.extension}@${this.protocol.client.endpoint} SIP/2.0\r\n`
                message += `Via: SIP/2.0/WSS b55dhqu9asr5.invalid;branch=${magicCookie}1114145\r\n`
                message += `To: <sip:${this.extension}@sip.dev.ca11.app>\r\n`
                message += `From: <sip:${this.protocol.client.user}@${this.protocol.client.endpoint}>;tag=${this.fromTag}\r\n`
                message += `CSeq: ${this.cseq} ${this.method}\r\n`
                message += `Call-ID: ${this.callId}\r\n`
                message += `Max-Forwards: ${hops}\n`
                message += 'Contact: <sip:g2ubil85@b55dhqu9asr5.invalid;transport=ws>;expires=600\r\n'
                message += 'Allow: ACK,CANCEL,INVITE,MESSAGE,BYE,OPTIONS,INFO,NOTIFY,REFER\r\n'
                message += 'Supported: outbound\r\n'
                message += 'Content-Type: application/sdp\r\n'
                message += 'User-Agent: CA11/1.0.0 (Linux/Chrome) ca11\r\n'
            } else if (this.method === 'REGISTER') {
                message += `${this.method} ${this.protocol.client.uri} SIP/2.0\r\n`
                message += `Via: SIP/2.0/WSS nb4btmdpfcgh.invalid;branch=${magicCookie}${this.protocol.generateToken(7)}\r\n`
                message += `To: <sip:${this.protocol.client.user}@sip.dev.ca11.app>\r\n`
                message += `From: <sip:${this.protocol.client.user}@sip.dev.ca11.app>;tag=${this.fromTag}\r\n`
                message += `Call-ID: ${this.protocol.client.callId}\r\n`
                message += `CSeq: ${this.cseq} ${this.method}\r\n`
                message += `Max-Forwards: ${hops}\n`
                message += `Contact: <sip:${this.protocol.client.contactName}@nb4btmdpfcgh.invalid;transport=ws>;expires=600\r\n`
                message += 'Allow: ACK,CANCEL,INVITE,MESSAGE,BYE,OPTIONS,INFO,NOTIFY,REFER\r\n'
                message += 'Supported: outbound, path, gruu\r\n'
                message += 'User-Agent: CA11/1.0.0 (Linux/Chrome) ca11\r\n'
            } else if (this.method === 'OPTIONS') {
                message += `SIP/2.0 200 OK\r\n`
                message += `Via: SIP/2.0/WS b55dhqu9asr5.invalid;branch=${this.branch}\r\n`
                message += `From: <sip:${this.protocol.client.user}@sip.dev.ca11.app>;tag=${this.fromTag}\r\n`
                message += `To: <sip:${this.protocol.client.contactName}@127.0.0.1>;tag=${this.toTag}\r\n`
                message += `CSeq: ${this.cseq} ${this.method}\r\n`
                message += `Call-ID: ${this.callId}\r\n`
                message += `Supported: outbound\r\n`
                message += `User-Agent: CA11/undefined (Linux/Chrome) ca11\r\n`
                message += `Allow: ACK,BYE,CANCEL,INFO,INVITE,MESSAGE,NOTIFY,OPTIONS,PRACK,REFER,REGISTER,SUBSCRIBE\r\n`
                message += `Accept: application/sdp,application/dtmf-relay\r\n`
            } else {
                throw new Error('Not implemented')
            }

            if (this.digest) {
                message += `${this.protocol.authorize(this)}\r\n`
            }

            message += `Content-Length: ${this.content.length}\r\n\r\n`

            if (this.content.length) {
                message += `${this.content}\r\n`
            }

            return message
        }
    }
}


class Protocol {

    constructor(client) {
        this.client = client
        this.nc = 0
        this.ncHex = '00000000'
        this.cseq = 1
    }


    authorize(message) {
        this.nc += 1
        const hex = this.nc.toString(16)
        this.ncHex = '00000000'.substr(0, 8 - hex.length) + hex

        this.cnonce = this.generateToken(12)
        const hash1 = md5(`${this.client.user}:${message.digest['Digest realm']}:${this.client.password}`)
        const hash2 = md5(`${message.method}:${this.client.uri}`)
        const response = md5(`${hash1}:${message.digest.nonce}:${this.ncHex}:${this.cnonce}:auth:${hash2}`)
        return [
            'Authorization: Digest algorithm=MD5',
            `username="${this.client.user}"`,
            `realm="${message.digest['Digest realm']}"`,
            `nonce="${message.digest.nonce}"`,
            `uri="${this.client.uri}"`,
            `response="${response}"`,
            `opaque="${message.digest.opaque}"`,
            'qop=auth',
            `cnonce="${this.cnonce}"`,
            `nc=${this.ncHex}`,
        ].join(', ')
    }


    commaSepToObject(val) {
        const keypairs = val.split(',')
        const foo = {}
        for (const keypair of keypairs) {
            const [key, value] = keypair.split('=')
            foo[key] = value.replace(/"/g, '')
        }
        return foo
    }


    generateToken(tokenSize = 12) {
        let token = ''
        for (let i = 0; i < tokenSize; i++) {
            token += Math.floor(Math.random() * 10) + 1
        }
        return token
    }


    incoming(rawMessage) {
        const message = new SipMessage(this)
        message.parseIncoming(rawMessage)
        return message
    }

    outgoing(messageOptions) {
        const message = new SipMessage(this)
        message.parseOutgoing(messageOptions)
        message.cseq = this.cseq
        this.cseq += 1
        return message
    }

}

export default Protocol