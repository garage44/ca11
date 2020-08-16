import EventEmitter from 'eventemitter3'

/**
 * An Endpoint is an abstraction to decouple
 * transport and node. The Endpoint generates
 * a one-time session Key to the other node
 * using ECDHE.
 */
class Endpoint extends EventEmitter {

    constructor(network, node, transport) {
        super()

        this.app = network.app
        this.network = network
        this.transport = transport

        // Endpoint is already identified (e.g. from `sig11:network`)
        if (node.id && node.publicKey) {
            this.id = node.id
            this.headless = node.headless
            this.publicKey = node.publicKey
        } else {
            // Perform an initial identification.
            this.once('sig11:identify', async(_node) => {
                this.headless = _node.headless
                this.publicKey = _node.publicKey

                this.name = _node.name
                this.number = _node.number
                this.id = await this.app.crypto.hash(this.publicKey.n)

                this.app.logger.info(`identified ${this.name}:${this.number}:${this.id.sid()}`)
                this.emit('sig11:identified')
            })
        }
    }


    send(msg) {
        try {
            this.transport.send(msg)
            // eslint-disable-next-line no-empty
        } catch (err) {}
    }


    /**
     * Serialize to a node's properties.
     * @returns {Object} - JSON-serializable Node info.
     */
    serialize() {
        return {
            headless: this.headless,
            id: this.id,
            name: this.name,
            number: this.number,
            publicKey: this.publicKey,
        }
    }
}

export default Endpoint
