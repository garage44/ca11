import EventEmitter from 'eventemitter3'
import Protocol from './lib/protocol.js'

class Sig11Client extends EventEmitter {

    constructor(options) {
        super()
        Object.assign(this, options)

        this.protocol = new Protocol()
    }


    connect() {
        // Close the connection and let the onClose event
        // do a new connection attempt.
        if (this.connected) {
            this.disconnect()
            return
        }

        this.ws = new WebSocket(`wss://${this.endpoint}`, 'sig11')
        this.ws.onopen = this.onOpen.bind(this)
        this.ws.onclose = this.onClose.bind(this)
    }


    disconnect(reconnect = true) {
        this.reconnect = reconnect
        this.ws.close()
        delete this.ws
    }


    /**
     * Create a public key handshake to negotiate
     * a secure connection with.
     * @param {String} node - The Node to start the session with.
     * @returns {Promise} - Resolves when the AES secret is known.
     */
    async negotiateSession(node) {
        node._negotiating = true
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async(resolve, reject) => {
            node._sessionPromise = {reject, resolve}
            // Generate a transient ECDH keypair.
            node.ecdh = await crypto.subtle.generateKey({name: 'ECDH', namedCurve: 'P-256'}, true, ['deriveKey'])
            const signedPublicKeyRaw = await this.signEcPublicKey(node.ecdh)
            const signedPublicKey = this.app.crypto.__dataArrayToBase64(signedPublicKeyRaw)

            const data = await this.protocol.outRelay(node.id, 'session', {signedPublicKey})
            this.ws.send(data)
        })
    }
    onClose() {
        this.app.setState({sig11: {status: 'disconnected'}})
        if (this.reconnect) {
            this.app.logger.debug(`${this}transport closed (reconnect)`)
            setTimeout(() => {
                this.connect()
            }, 500)
        } else {
            this.app.logger.debug(`${this}transport closed`)
        }
    }
    onMessage(e) {
        const msg = JSON.parse(e.data)
        this.network.protocol.in(msg)
    }
    onOpen() {
        this.connected = true

        this.ws.onmessage = this.onMessage.bind(this)
        this.emit('connected')
    }
    register(identity) {
        this.ws.send(this.network.protocol.out('identify', {
            headless: this.app.env.isNode,
            name: identity.name,
            number: identity.number,
            publicKey: identity.publicKey,
        }))
    }
    async signEcPublicKey(ecdh) {
        const publicKeyRaw = await crypto.subtle.exportKey('raw', ecdh.publicKey)
        const signatureRaw = await crypto.subtle.sign(
            {name: 'RSA-PSS', saltLength: 16}, this.network.keypair.privateKey, publicKeyRaw,
        )

        const signedPublicKeyRaw = new Uint8Array(publicKeyRaw.byteLength + signatureRaw.byteLength)
        signedPublicKeyRaw.set(new Uint8Array(publicKeyRaw))
        signedPublicKeyRaw.set(new Uint8Array(signatureRaw), publicKeyRaw.byteLength)
        return signedPublicKeyRaw
    }
    /**
     * Send an encrypted message across the SIG11
     * network to a node.
     * @param {String} nodeId - ID of the node to emit the message on.
     * @param {String} event - The event to emit.
     * @param {Object} payload - Payload to send.
     */
    async transmit(nodeId, event, payload) {
        if (event.includes('sig11:')) throw new Error('invalid `sig11:` prefix')

        const node = this.network.node(nodeId)
        if (!node.sessionQ) node.sessionQ = []

        // A sessionKey must be negotiated before sending
        // any data over the network. Messages trying to be
        // send are queud and sent after negotiation.
        if (!node.sessionKey) {
            if (node._negotiating) {
                node.sessionQ.push(async() => {
                    const message = await this.network.protocol.outRelay(node.id, event, payload, node.sessionKey)
                    return message
                })
                return
            } else {
                await this.negotiateSession(node)
            }
        }

        const message = await this.network.protocol.outRelay(node.id, event, payload, node.sessionKey)
        this.ws.send(message)
        // Send queued messages.
        const messages = await Promise.all(node.sessionQ.map((x) => x()))
        messages.forEach((msg) => this.ws.send(msg))
    }





















    async verifyEcPublicKey(ecdh, node, signedPublicKey) {
        const signedPublicKeyRaw = this.app.crypto.__base64ToDataArray(signedPublicKey)

        let position = signedPublicKeyRaw.byteLength - 256
        const signature = signedPublicKeyRaw.slice(position)
        const nodeEcPublicKeyRaw = signedPublicKeyRaw.slice(0, position)

        const nodeRsaPubKey = await crypto.subtle.importKey(
            'jwk', node.publicKey, this.app.crypto.rsa.params, true, ['verify'],
        )

        // Verify that this message came from the public rsa identity.
        const res = await crypto.subtle.verify(
            {name: 'RSA-PSS', saltLength: 16 }, nodeRsaPubKey, signature, nodeEcPublicKeyRaw,
        )

        if (!res) throw new Error('incorrect session signature')
        // We verified that the signature was sent by an entity
        // that is in control of the private RSA key . Proceed
        // with establishing a shared secret between nodeId and
        // this peer.
        const nodeEcPublicKey = await crypto.subtle.importKey(
            'raw', nodeEcPublicKeyRaw, {name: 'ECDH', namedCurve: 'P-256'}, true, [ ],
        )

        return await crypto.subtle.deriveKey(
            {name: 'ECDH', public: nodeEcPublicKey},
            ecdh.privateKey,
            {length: 256, name: 'aes-gcm'}, false, ['decrypt', 'encrypt'],
        )
    }
}

export default Sig11Client