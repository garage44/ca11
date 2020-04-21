import EventEmitter from 'eventemitter3'

class Sip extends EventEmitter {

    constructor(options) {
        super()
        this.socket = new WebSocket(options.server, 'sip')
        this.logger = options.logger

        this.socket.onopen = (e) => {
            this.logger.info(`${this}socket open`)
            this.register()
        }

        this.socket.onmessage = (e) => {
            this.logger.debug(`${this}${e.data}`)
        }

        this.socket.onclose = (e) => {
            this.logger.info(`${this}socket closed`)
        }
    }

    register() {
        console.log("SEND", this.socket)
        this.socket.send(`
REGISTER sip:sip.dev.ca11.app SIP/2.0
Via: SIP/2.0/WSS dgd0rvbluh70.invalid;branch=z9hG4bK9607251
Max-Forwards: 70
To: <sip:1000@sip.ca11.app>
From: <sip:1000@sip.ca11.app>;tag=1h9o0sgbim
Call-ID: mvlj5rb5i964qlc5668mmh
CSeq: 7932 REGISTER
Contact: <sip:btn59ae9@dgd0rvbluh70.invalid;transport=ws>;reg-id=1;+sip.instance="<urn:uuid:fc386318-be53-4bb1-9112-afa752ba35ba>";expires=600
Allow: ACK,CANCEL,INVITE,MESSAGE,BYE,OPTIONS,INFO,NOTIFY,REFER
Supported: path, gruu, outbound
User-Agent: CA11/1.0.0 (Linux/Chrome) ca11
Content-Length: 0
`)
    }

    toString() {
        return `[sip] `
    }

}

export default Sip