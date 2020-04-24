import EventEmitter from 'eventemitter3'
import md5 from "blueimp-md5"

console.log("MD5", md5)


class SipMessage {
    constructor(raw, direction) {
        this.direction = direction
        this.raw = raw

        this.header = {}
        this.parseHeader()
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

    parseHeader() {
        this.lines = this.raw.trim().split('\r\n').filter(i => i !== '')
        if (!this.lines.length) {
            this.code = 'PING'
            return
        }

        if (this.direction === 'incoming') {
            const method = this.lines[0].split(' ')
            this.code = method[1]
            this.lines.shift()
        }

        for (const line of this.lines) {
            const key = line.split(':')[0]
            const value = line.replace(`${key}:`, '').trim()
            this.header[key] = value
        }

        if (this.header['WWW-Authenticate']) {
            this.digest = this.commaSepToObject(this.header['WWW-Authenticate'])
        }

    }
}

class Sip extends EventEmitter {

    constructor(options) {
        super()

        this.state = 'unregistered'
        this.options = options

        this.uri = `sip:${options.server}`
        this.registerCount = 0

        this.socket = new WebSocket(`wss://${options.server}`, 'sip')
        this.logger = options.logger

        this.socket.onopen = () => {
            this.logger.info(`${this}socket open`)
            this.register()
        }

        this.socket.onmessage = (e) => {
            this.logger.debug(`${this}${e.data}`)
            const message = new SipMessage(e.data, 'incoming')

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


    register(digest = null) {
        this.cnonce = this.generateToken(12)
        this.nc = 1
        this.ncHex = '00000001'

        let message = ''
        message += `REGISTER ${this.uri} SIP/2.0\r\n`
        message += 'Via: SIP/2.0/WSS b55dhqu9asr5.invalid;branch=z9hG4bK1114145\r\n'
        message += 'To: <sip:2000@sip.dev.ca11.app>\r\n'
        message += 'From: <sip:2000@sip.dev.ca11.app>;tag=qcjf8jrqf3\r\n'
        message += 'CSeq: 1198 REGISTER\r\n'
        message += 'Call-ID: smnsh62lctqj0j0htccb3m\r\n'
        message += 'Max-Forwards: 70\n'
        message += 'Contact: <sip:g2ubil85@b55dhqu9asr5.invalid;transport=ws>;expires=600\r\n'
        message += 'Allow: ACK,CANCEL,INVITE,MESSAGE,BYE,OPTIONS,INFO,NOTIFY,REFER\r\n'
        message += 'Supported: outbound, path, gruu\r\n'
        message += 'User-Agent: CA11/1.0.0 (Linux/Chrome) ca11\r\n'


        if (digest) {
            const hash1 = md5(`${this.options.user}:${digest['Digest realm']}:${this.options.password}`)
            const hash2 = md5(`REGISTER:${this.uri}`)
            const response = md5(`${hash1}:${digest.nonce}:${this.ncHex}:${this.cnonce}:auth:${hash2}`)
            console.log("RESPONSE", response)
            message += `Authorization: Digest algorithm=MD5, username="${this.options.user}", realm="${digest['Digest realm']}", nonce="${digest.nonce}", uri="${this.uri}", response="${response}", opaque="${digest.opaque}", qop=auth, cnonce="${this.cnonce}", nc=${this.ncHex}\r\n`
        }

        message += 'Content-Length: 0\r\n\r\n'
        this.socket.send(message)

    }

    toString() {
        return `[sip] `
    }

}

export default Sip