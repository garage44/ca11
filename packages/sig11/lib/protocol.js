class Protocol {
    constructor(network) {
        this.network = network
        this.app = this.network.app
        this.msgId = 0
    }

    /**
     * Deal with an incoming emitter message. Emits either on
     * a supplied endpoint or on the app EventEmitter with
     * the `sig11:` prefix.
     * @param {*} msg - The raw incoming message.
     * @param {*} endpoint - Endpoint to pass the message to.
     */
    async in(msg, endpoint) {
        let [event, data, msgId] = msg
        const source = String(msgId).split(':')
        // This message was relayed. Add nodeId to the data.
        // Keep in mind to make this more robust when more
        // hops are needed.
        if (source.length > 1) {
            const nodeId = source[0]
            if (event === 'unpack') {
                const node = this.network.node(nodeId)
                if (!node) throw new Error('invalid node to unpack data from')
                if (!node.sessionKey) throw new Error('no sessionKey to unpack data')

                try {
                    msg = await this.app.crypto.decrypt(node.sessionKey, data)
                    window.msg = msg
                } catch (err) {
                    throw new Error('failed to decrypt session data', err)
                }

                try {
                    msg = JSON.parse(msg)
                    event = msg[0]
                    data = msg[1]
                } catch (err) {
                    throw new Error('failed to unpack json data')
                }
            }
            // Emit the source node with the data payload,
            // because this is a relayed message.
            data.nodeId = nodeId
        }

        if (endpoint) {
            endpoint.emit(`sig11:${event}`, data)
        } else {
            this.app.emit(`sig11:${event}`, data)
        }
    }


    inRelay(msg, source) {
        const [nodeId, event, data, msgId] = msg

        const endpoint = this.network.endpoints.get(nodeId)
        if (endpoint) {
            endpoint.transport.send(JSON.stringify([event, data, `${source.id}:${msgId}`]))
        } else {
            this.app.logger.warn(`${this}no endpoint ${source.id}:${nodeId.id}`)
        }
    }


    out(event, data) {
        const msg = [event, data, this.msgId]
        this.msgId += 1
        return JSON.stringify(msg)
    }


    async outRelay(nodeId, event, data, sessionKey = null) {
        let msg = [nodeId, event, data, this.msgId]

        if (sessionKey) {
            const cipherdata = await this.app.crypto.encrypt(sessionKey, JSON.stringify([event, data]))
            msg = [nodeId, 'unpack', cipherdata, this.msgId]
        }
        this.msgId += 1
        return JSON.stringify(msg)
    }
}


export default Protocol
