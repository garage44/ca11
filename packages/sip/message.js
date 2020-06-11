
import * as sdpTransform from 'sdp-transform'


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

const codeMap = {
    100: 'Trying',
    180: 'Ringing',
    200: 'OK',
}

const hops = 70
const defaultHost = `${utils.token(12)}.invalid`
export const magicCookie = 'z9hG4bK'


export class SipRequest {

    constructor(client, context) {
        this.client = client
        this.context = context

        if (!this.context.content) this.context.content = ''
        else {
            this.sdp = sdpTransform.parse(this.context.content)
        }

        this.header = {}
    }

    toString() {
        let methodTarget, toTarget
        if (['INFO','REGISTER'].includes(this.context.method)) {
            methodTarget = `sip:${this.client.endpoint}`
        } else {
            methodTarget = `sip:${this.context.extension}@${this.client.endpoint}`
        }
        if (this.context.extension) {
            toTarget = `sip:${this.context.extension}@${this.client.endpoint}`
        } else {
            toTarget = `sip:${this.client.user}@${this.client.endpoint}`
        }

        let message = `${this.context.method} ${methodTarget} SIP/2.0\r\n`
        const host = this.context.host ? this.context.host : defaultHost
        const viaOptions = [`Via: SIP/2.0/WSS ${host}`]

        if (this.context.rport) viaOptions.push('rport')
        viaOptions.push(`branch=${this.context.branch}`)
        if (this.context.alias) viaOptions.push('alias')

        message += `${viaOptions.join(';')}\r\n`

        message += `Max-Forwards: ${hops}\r\n`


        let fromHeader = `From: <sip:${this.client.user}@${this.client.endpoint}>`
        if (this.context.fromTag) fromHeader += `;tag=${this.context.fromTag}`
        message += `${fromHeader}\r\n`

        let toHeader = `To: <${toTarget}>`
        if (this.context.toTag) toHeader += `;tag=${this.context.toTag}`
        message += `${toHeader}\r\n`

        let callId = this.context.callId
        // Fallback to a client defined callId.
        if (!this.context.callId) callId = this.client.callId

        message += `Call-ID: ${callId}\r\n`
        message += `CSeq: ${this.context.cseq} ${this.context.method}\r\n`

        if (['REGISTER', 'INVITE'].includes(this.context.method)) {
            message += `Contact: <sip:${this.client.contactName}@${defaultHost};transport=ws;ob>\r\n`
        }

        if (this.context.method === 'INVITE') {
            message += 'Allow: ACK,CANCEL,INVITE,MESSAGE,BYE,OPTIONS,INFO,NOTIFY,REFER\r\n'
            message += 'Supported: outbound\r\n'
        }

        message += 'User-Agent: CA11/1.0.0 (Linux/Chrome) ca11\r\n'

        if (this.context.digest) {
            message += `${this.client.authorizeMessage(this)}\r\n`
        }

        if (this.context.method === 'INFO') {
            message += 'Content-Type: application/dtmf-relay\r\n'
        } else if (this.context.content.length) {
            message += 'Content-Type: application/sdp\r\n'
        }

        // Header MUST end with two empty lines at the end.
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
        else {
            this.sdp = sdpTransform.parse(this.context.content)
        }
    }


    toString() {
        let message = `SIP/2.0 ${this.context.code} ${codeMap[this.context.code]}\r\n`
        const host = this.context.host ? this.context.host : defaultHost
        const viaOptions = [`Via: SIP/2.0/WSS ${host}`]

        if (this.context.rport) viaOptions.push('rport')
        viaOptions.push(`branch=${this.context.branch}`)
        if (this.context.alias) viaOptions.push('alias')

        message += `${viaOptions.join(';')}\r\n`

        let fromHost = this.context.fromHost ? this.context.fromHost : `${this.client.user}@${this.client.endpoint}`
        let fromHeader = `From: <sip:${fromHost}>`
        if (this.context.fromTag) fromHeader += `;tag=${this.context.fromTag}`
        message += `${fromHeader}\r\n`

        const toTarget = this.context.toTarget ? this.context.toTarget : `${this.client.user}@${this.client.endpoint}`
        let toHeader = `To: <sip:${toTarget}>`
        if (this.context.toTag) toHeader += `;tag=${this.context.toTag}`

        message += `${toHeader}\r\n`

        // if ([180, 200].includes(this.context.code)) {
        //     message += `Contact: <sip:${this.client.contactName}@nb4btmdpfcgh.invalid;transport=ws>;expires=600\r\n`
        // }

        message += `Call-ID: ${this.context.callId}\r\n`
        message += `CSeq: ${this.context.cseq} ${this.context.method}\r\n`

        message += 'User-Agent: CA11/1.0.0 (Linux/Chrome) ca11\r\n'

        if (this.context.method === 'OPTIONS') {
            message += 'Allow: ACK,BYE,CANCEL,INFO,INVITE,MESSAGE,NOTIFY,OPTIONS,PRACK,REFER,REGISTER,SUBSCRIBE\r\n'
            message += 'Supported: outbound\r\n'
            message += 'Accept: application/sdp,application/dtmf-relay\r\n'
        }

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

