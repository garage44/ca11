
const magicCookie = 'z9hG4bK'
const hops = 70
const codeMap = {
    100: 'Trying',
    180: 'Ringing',
    200: 'OK',
}

/**
 * Utils that help process SIP messages.
 */
export const utils = {

    commaSepToObject(val) {
        const keypairs = val.split(',')
        const foo = {}
        for (const keypair of keypairs) {
            const [key, value] = keypair.split('=')
            foo[key] = value.replace(/"/g, '')
        }
        return foo
    },

    token(tokenSize = 12) {
        let token = ''
        for (let i = 0; i < tokenSize; i++) {
            token += Math.floor(Math.random() * 10) + 1
        }
        return token
    },

}

export class SipRequest {

    constructor(client, context) {
        this.client = client
        this.context = context

        if (!this.context.fromTag) {
            this.context.fromTag = utils.token(10)
        }

        if (!this.context.content) this.context.content = ''

        this.header = {}
    }

    toString() {
        let message = ''
        if (this.context.method === 'ACK') {
            if (this.context.transport) {
                message += `${this.context.method} sip:${this.client.endpoint};transport=${this.context.transport} SIP/2.0\r\n`
            } else {
                message += `${this.context.method} sip:${this.context.extension}@${this.client.endpoint} SIP/2.0\r\n`
            }
            message += `Via: SIP/2.0/WSS b55dhqu9asr5.invalid;branch=${magicCookie}1114145\r\n`
            message += `To: <sip:${this.context.extension}@sip.dev.ca11.app>\r\n`
            message += `From: <sip:${this.client.user}@${this.client.endpoint}>;tag=${this.context.fromTag}\r\n`
            message += `Call-ID: ${this.context.callId}\r\n`
            message += `CSeq: ${this.context.cseq} ${this.context.method}\r\n`
            message += `Max-Forwards: ${hops}\n`
        } else if (this.context.method === 'BYE') {
            console.log("BYEEE??!!!")
            message += `${this.context.method} sip:${this.client.endpoint};transport=ws SIP/2.0\r\n`
            message += `From: <sip:${this.client.user}@${this.client.endpoint}>;tag=${this.context.fromTag}\r\n`
            message += `To: <sip:${this.context.extension}@sip.dev.ca11.app>;tag=${this.context.toTag}\r\n`
            message += `Via: SIP/2.0/WSS b55dhqu9asr5.invalid;branch=${magicCookie}1114145\r\n`
            message += `CSeq: ${this.context.cseq} ${this.context.method}\r\n`
            message += `Call-ID: ${this.context.callId}\r\n`
            message += `Max-Forwards: ${hops}\n`
            message += `Supported: outbound\r\n`
            message += `User-Agent: CA11/undefined (Linux/Chrome) ca11\r\n`
        } else if (this.context.method === 'INVITE') {
            message += `${this.context.method} sip:${this.context.extension}@${this.client.endpoint} SIP/2.0\r\n`
            message += `Via: SIP/2.0/WSS b55dhqu9asr5.invalid;branch=${magicCookie}1114145\r\n`
            message += `To: <sip:${this.context.extension}@sip.dev.ca11.app>\r\n`
            message += `From: <sip:${this.client.user}@${this.client.endpoint}>;tag=${this.context.fromTag}\r\n`
            message += `CSeq: ${this.context.cseq} ${this.context.method}\r\n`
            message += `Call-ID: ${this.context.callId}\r\n`
            message += `Max-Forwards: ${hops}\n`
            message += 'Contact: <sip:g2ubil85@b55dhqu9asr5.invalid;transport=ws>;expires=600\r\n'
            message += 'Allow: ACK,CANCEL,INVITE,MESSAGE,BYE,OPTIONS,INFO,NOTIFY,REFER\r\n'
            message += 'Supported: outbound\r\n'
            message += 'Content-Type: application/sdp\r\n'
            message += 'User-Agent: CA11/1.0.0 (Linux/Chrome) ca11\r\n'
        } else if (this.context.method === 'REGISTER') {
            message += `${this.context.method} ${this.client.uri} SIP/2.0\r\n`
            message += `Via: SIP/2.0/WSS nb4btmdpfcgh.invalid;branch=${magicCookie}${utils.token(7)}\r\n`
            message += `To: <sip:${this.client.user}@sip.dev.ca11.app>\r\n`
            message += `From: <sip:${this.client.user}@sip.dev.ca11.app>;tag=${this.context.fromTag}\r\n`
            message += `Call-ID: ${this.client.callId}\r\n`
            message += `CSeq: ${this.context.cseq} ${this.context.method}\r\n`
            message += `Max-Forwards: ${hops}\n`
            message += `Contact: <sip:${this.client.contactName}@nb4btmdpfcgh.invalid;transport=ws>;expires=600\r\n`
            message += 'Allow: ACK,CANCEL,INVITE,MESSAGE,BYE,OPTIONS,INFO,NOTIFY,REFER\r\n'
            message += 'Supported: outbound, path, gruu\r\n'
            message += 'User-Agent: CA11/1.0.0 (Linux/Chrome) ca11\r\n'
        } else {
            throw new Error(`request method not implemented: ${this.context.method}`)
        }

        if (this.context.digest) {
            message += `${this.client.authorizeMessage(this)}\r\n`
        }

        message += `Content-Length: ${this.context.content.length}\r\n\r\n`

        if (this.context.content.length) {
            message += `${this.context.content}\r\n`
        }

        return message
    }
}

export class SipResponse {
    constructor(client, context) {
        this.client = client
        this.header = {}

        this.context = context

        if (!this.context.content) this.context.content = ''
    }


    toString() {
        let message = ''

        if (this.context.method === 'OPTIONS') {
            message += `SIP/2.0 200 OK\r\n`
            message += `Via: SIP/2.0/WS b55dhqu9asr5.invalid;branch=${this.context.branch}\r\n`
            message += `From: <sip:${this.client.user}@sip.dev.ca11.app>;tag=${this.context.fromTag}\r\n`
            message += `To: <sip:${this.client.contactName}@127.0.0.1>;tag=${this.context.toTag}\r\n`
            message += `CSeq: ${this.context.cseq} ${this.context.method}\r\n`
            message += `Call-ID: ${this.context.callId}\r\n`
            message += `Supported: outbound\r\n`
            message += `User-Agent: CA11/undefined (Linux/Chrome) ca11\r\n`
            message += `Allow: ACK,BYE,CANCEL,INFO,INVITE,MESSAGE,NOTIFY,OPTIONS,PRACK,REFER,REGISTER,SUBSCRIBE\r\n`
            message += `Accept: application/sdp,application/dtmf-relay\r\n`
        } else if (this.context.method === 'INVITE') {

            if (this.context.code === 100) {
                message += `SIP/2.0 100 Trying\r\n`
                message += `Via: SIP/2.0/WS b55dhqu9asr5.invalid;branch=${this.context.branch}\r\n`
                message += `From: <sip:${this.client.user}@sip.dev.ca11.app>;tag=${this.context.fromTag}\r\n`
                message += `To: <sip:${this.client.contactName}@127.0.0.1>\r\n`
                message += `CSeq: ${this.context.cseq} ${this.context.method}\r\n`
                message += `Call-ID: ${this.context.callId}\r\n`
                message += `Supported: outbound\r\n`
                message += `User-Agent: CA11/undefined (Linux/Chrome) ca11\r\n`
            } else if (this.context.code === 180) {
                message += `SIP/2.0 180 Ringing\r\n`
                message += `Via: SIP/2.0/WS b55dhqu9asr5.invalid;branch=${this.context.branch}\r\n`
                message += `From: <sip:${this.client.user}@sip.dev.ca11.app>;tag=${this.context.fromTag}\r\n`
                message += `To: <sip:${this.client.contactName}@127.0.0.1>;tag=${this.context.toTag}\r\n`
                message += `CSeq: ${this.context.cseq} ${this.context.method}\r\n`
                message += `Call-ID: ${this.context.callId}\r\n`
                message += `Contact: <sip:${this.client.contactName}@nb4btmdpfcgh.invalid;transport=ws>;expires=600\r\n`
                message += `Supported: outbound\r\n`
                message += `User-Agent: CA11/undefined (Linux/Chrome) ca11\r\n`
            } else if (this.context.code === 200) {
                message += `SIP/2.0 200 OK\r\n`
                message += `Via: SIP/2.0/WS b55dhqu9asr5.invalid;branch=${this.context.branch};alias\r\n`
                message += `From: <sip:${this.client.user}@sip.dev.ca11.app>;tag=${this.context.fromTag}\r\n`
                message += `To: <sip:${this.client.contactName}@127.0.0.1>;tag=${this.context.toTag}\r\n`
                message += `CSeq: ${this.context.cseq} ${this.context.method}\r\n`
                message += `Contact: <sip:${this.client.contactName}@nb4btmdpfcgh.invalid;transport=ws>;expires=600\r\n`
                message += `Call-ID: ${this.context.callId}\r\n`
                message += `Supported: outbound\r\n`
                message += `User-Agent: CA11/undefined (Linux/Chrome) ca11\r\n`
                message += 'Content-Type: application/sdp\r\n'
            }
        }

        message += `Content-Length: ${this.context.content.length}\r\n\r\n`
        if (this.context.content.length) {
            message += `${this.context.content}\r\n`
        }

        return message
    }
}

