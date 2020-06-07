
const codeMap = {
    100: 'Trying',
    180: 'Ringing',
    200: 'OK',
}

const hops = 70
export const magicCookie = 'z9hG4bK'

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

        if (!this.context.content) this.context.content = ''

        this.header = {}
    }

    toString() {
        let methodTarget, toTarget
        if (this.context.extension) {
            methodTarget = `sip:${this.context.extension}@${this.client.endpoint}`
            toTarget = `sip:${this.context.extension}@${this.client.endpoint}`

        } else {
            methodTarget = `sip:${this.client.endpoint}`
            toTarget = `sip:${this.client.user}@${this.client.endpoint}`
        }

        let message = `${this.context.method} ${methodTarget} SIP/2.0\r\n`
        message += `Via: SIP/2.0/WSS b55dhqu9asr5.invalid;branch=${this.context.branch}\r\n`
        message += `Max-Forwards: ${hops}\r\n`

        let toHeader = `To: <${toTarget}>`
        if (this.context.toTag) toHeader += `;tag=${this.context.toTag}`
        message += `${toHeader}\r\n`

        let fromHeader = `From: <sip:${this.client.user}@${this.client.endpoint}>`
        if (this.context.fromTag) fromHeader += `;tag=${this.context.fromTag}`
        message += `${fromHeader}\r\n`

        let callId = this.context.callId
        // Fallback to a client defined callId.
        if (!this.context.callId) callId = this.client.callId

        message += `Call-ID: ${callId}\r\n`
        message += `CSeq: ${this.context.cseq} ${this.context.method}\r\n`

        if (['REGISTER', 'INVITE'].includes(this.context.method)) {
            message += `Contact: <sip:${this.client.contactName}@nb4btmdpfcgh.invalid;transport=ws>;expires=600\r\n`
        }

        message += 'User-Agent: CA11/1.0.0 (Linux/Chrome) ca11\r\n'

        if (this.context.digest) {
            message += `${this.client.authorizeMessage(this)}\r\n`
        }

        // Header MUST end with two empty lines at the end.
        if (this.context.content.length) {
            message += 'Content-Type: application/sdp\r\n'
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
        let message = `SIP/2.0 ${this.context.code} ${codeMap[this.context.code]}\r\n`
        message += `Via: SIP/2.0/WS b55dhqu9asr5.invalid;branch=${this.context.branch}\r\n`

        let toTarget = `sip:${this.client.user}@${this.client.endpoint}`
        let toHeader = `To: <${toTarget}>`
        if (this.context.toTag) toHeader += `;tag=${this.context.toTag}`
        message += `${toHeader}\r\n`

        let fromHeader = `From: <sip:${this.client.user}@${this.client.endpoint}>`
        if (this.context.fromTag) fromHeader += `;tag=${this.context.fromTag}`
        message += `${fromHeader}\r\n`

        message += `Call-ID: ${this.context.callId}\r\n`
        message += `CSeq: ${this.context.cseq} ${this.context.method}\r\n`

        if ([180, 200].includes(this.context.code)) {
            message += `Contact: <sip:${this.client.contactName}@nb4btmdpfcgh.invalid;transport=ws>;expires=600\r\n`
        }

        message += 'User-Agent: CA11/1.0.0 (Linux/Chrome) ca11\r\n'

        if (this.context.content.length) {
            message += 'Content-Type: application/sdp\r\n'
        }

        message += `Content-Length: ${this.context.content.length}\r\n\r\n`
        if (this.context.content.length) {
            message += `${this.context.content}`
        }

        return message
    }
}

