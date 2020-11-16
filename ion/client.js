import Call from './call.js'
import EventEmitter from 'eventemitter3'


class ClientIon extends EventEmitter {

    constructor(config) {
        super()
        this.calls = {}
        this.config = config
    }


    connect() {
        this.socket = new WebSocket(`wss://${this.config.domain}/ws`)
        this.socket.addEventListener('message', async(event) => {
            const resp = JSON.parse(event.data)

            // Match will a call.
            if (this.calls[resp.id]) {
                const call = this.calls[resp.id]
                this.__call = call
                call.emit('message', resp)

            } else if (resp.method === 'offer') {
                // Server renegotiation
                await this.__call.pc.setRemoteDescription(resp.params)
                const answer = await this.__call.pc.createAnswer()
                await this.__call.pc.setLocalDescription(answer)
                this.socket.send(JSON.stringify({
                    id: this.__call.id,
                    method: 'answer',
                    params: { desc: answer },
                }))
            } else {
                // Ignore trickle method
            }
        })

    }

}

export default ClientIon