
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
    501: 'Not Implemented',
}

const hops = 70
const defaultHost = `${utils.token(12)}.invalid`
export const magicCookie = 'z9hG4bK'


export class SipRequest {

    constructor(client, context) {
        this.client = client
        this.context = context

        if (!this.context.content) this.context.content = ''
        else this.sdp = sdpTransform.parse(this.context.content)
    }

    toString() {
        let methodTarget
        if (['INFO','REGISTER'].includes(this.context.method)) {
            methodTarget = `sip:${this.client.domain}`
        } else {
            methodTarget = `sip:${this.context.extension}@${this.client.domain}`
        }

        let message = `${this.context.method} ${methodTarget} SIP/2.0\r\n`

        const viaHeader = []
        if (this.context.via) {
            if (this.context.via.host) viaHeader.push(`Via: SIP/2.0/WSS ${this.context.via.host}`)
            else viaHeader.push(`Via: SIP/2.0/WSS ${defaultHost}`)

            if (this.context.via.rport) viaHeader.push('rport')
            if (this.context.via.branch) viaHeader.push(`branch=${this.context.via.branch}`)
            if (this.context.via.alias) viaHeader.push('alias')
        } else viaHeader.push(`Via: SIP/2.0/WSS ${defaultHost}`)

        message += `${viaHeader.join(';')}\r\n`
        message += `Max-Forwards: ${hops}\r\n`

        let fromHeader = []
        if (this.context.from) {
            if (this.context.from.aor) fromHeader.push(`From: <sip:${this.context.from.aor}>`)
            else if (this.context.from.raw) fromHeader.push(`From: ${this.context.from.raw}`)
            else fromHeader.push(`From: <sip:${this.client.identity.endpoint}@${this.client.domain}>`)
            if (this.context.from.tag) fromHeader.push(`tag=${this.context.from.tag}`)
        }
        else {
            fromHeader.push(`From: <sip:${this.client.identity.endpoint}@${this.client.domain}>`)
        }

        message += `${fromHeader.join(';')}\r\n`

        let toHeader = []

        if (this.context.to) {
            if (this.context.to.aor) toHeader.push(`To: <sip:${this.context.to.aor}>`)
            else toHeader.push(`To: <sip:${this.client.identity.endpoint}@${this.client.domain}>`)
            if (this.context.to.tag) toHeader.push(`tag=${this.context.to.tag}`)
        } else {
            toHeader.push(`To: <sip:${this.client.identity.endpoint}@${this.client.domain}>`)
        }

        message += `${toHeader.join(';')}\r\n`

        message += `Call-ID: ${this.context.callId}\r\n`
        message += `CSeq: ${this.context.cseq} ${this.context.method}\r\n`

        if (['REGISTER', 'INVITE'].includes(this.context.method)) {
            message += `Contact: <sip:${this.client.identity.endpoint}@${defaultHost};transport=ws;ob>\r\n`
        }

        if (this.context.method === 'INVITE') {
            message += 'Allow: ACK,CANCEL,INVITE,MESSAGE,BYE,OPTIONS,INFO,NOTIFY,REFER\r\n'
            message += 'Supported: outbound\r\n'
        }

        message += 'User-Agent: CA11/1.0.0 (Linux/Chrome) ca11\r\n'

        if (this.context.digest) {
            message += `${this.client.authorizeMessage(this)}\r\n`
        }


        if (this.context.content.length) {
            if (this.context.method === 'INFO') message += 'Content-Type: application/dtmf-relay\r\n'
            else message += 'Content-Type: application/sdp\r\n'
        }

        // Header MUST end with two empty lines at the end.
        message += `Content-Length: ${this.context.content.length}\r\n\r\n`
        if (this.context.content.length) message += `${this.context.content}\r\n`

        return message
    }
}

export class SipResponse {
    constructor(client, context) {
        this.client = client
        this.context = context

        if (!this.context.content) this.context.content = ''
        else this.sdp = sdpTransform.parse(this.context.content)
    }


    toString() {
        let message = `SIP/2.0 ${this.context.code} ${codeMap[this.context.code]}\r\n`

        const viaHeader = []
        if (this.context.via) {
            if (this.context.via.host) viaHeader.push(`Via: SIP/2.0/WSS ${this.context.via.host}`)
            else viaHeader.push(`Via: SIP/2.0/WSS ${defaultHost}`)

            if (this.context.via.rport) viaHeader.push('rport')
            if (this.context.via.branch) viaHeader.push(`branch=${this.context.via.branch}`)
            if (this.context.via.alias) viaHeader.push('alias')
        }

        message += `${viaHeader.join(';')}\r\n`
        let fromHeader = []

        if (this.context.from) {
            if (this.context.from.aor) fromHeader.push(`From: <sip:${this.context.from.aor}>`)
            else if (this.context.from.raw) fromHeader.push(`From: ${this.context.from.raw}`)
            else fromHeader.push(`From: <sip:${this.client.identity.endpoint}@${this.client.domain}>`)
            if (this.context.from.tag) fromHeader.push(`tag=${this.context.from.tag}`)
        } else {
            fromHeader.push(`From: <sip:${this.client.identity.endpoint}@${this.client.domain}>`)
        }
        message += `${fromHeader.join(';')}\r\n`

        let toHeader = []
        if (this.context.to) {
            if (this.context.to.aor) toHeader.push(`To: <sip:${this.context.to.aor}>`)
            else toHeader.push(`To: <sip:${this.client.identity.endpoint}@${this.client.domain}>`)
            if (this.context.to.tag) toHeader.push(`tag=${this.context.to.tag}`)
        } else {
            toHeader.push(`To: <sip:${this.client.identity.endpoint}@${this.client.domain}>`)
        }

        message += `${toHeader.join(';')}\r\n`

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

