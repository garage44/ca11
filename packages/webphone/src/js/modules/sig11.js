import Module from '../lib/module.js'

import Endpoint from '@ca11/sig11/src/endpoint.js'
import Network from '@ca11/sig11/src/network.js'


/**
* SIG11 Network logic for CA11.
*/
class ModuleSIG11 extends Module {
    constructor(app) {
        super(app)
        app.sig11 = this

        this.network = new Network(this.app)
        this.reconnect = true

        this.app.on('ca11:services', async() => {
            if (!this.keypair) {
                let keypair
                if (this.app.state.sig11.identity.publicKey) {
                    keypair = await app.crypto.importIdentity(this.app.state.sig11.identity)
                } else {
                    keypair = await app.crypto.createIdentity()
                    // Save the serialized keypair to the store.
                    const identity = await app.crypto.serializeKeypair(keypair)
                    this.app.setState({sig11: {identity}}, {persist: true})
                }

                await this.network.setIdentity(keypair)
            }

            const enabled = this.app.state.sig11.enabled
            app.logger.info(`${this}sig11 ${enabled ? 'enabled' : 'disabled'}`)
            if (enabled) this.connect()
        })


        this.app.on('sig11:node-removed', (node) => {
            this.network.removeNode(node.id)
        })

        this.app.on('sig11:node-added', ({node, parent}) => {
            this.network.addNode(node, parent)
        })


        // Request comes in to open a new secured session between two nodes.
        this.app.on('sig11:session', async({nodeId, signedPublicKey}) => {
            // Generate rsa public key for advertised nodeId.
            const node = this.network.node(nodeId)
            if (!node) throw new Error('handshake from unknown node')

            const ecdh = await crypto.subtle.generateKey({name: 'ECDH', namedCurve: 'P-256'}, true, ['deriveKey'])
            const sessionKey = await this.verifyEcPublicKey(ecdh, node, signedPublicKey)

            node.sessionKey = sessionKey
            const signedPublicKeyRaw = await this.signEcPublicKey(ecdh)

            // Send this side's signed ec public key back.
            const data = await this.network.protocol.outRelay(node.id, 'session-ack', {
                signedPublicKey: this.app.crypto.__dataArrayToBase64(signedPublicKeyRaw),
            })
            this.ws.send(data)
        })


        // Other side established a sessionKey. Let's do the same here.
        this.app.on('sig11:session-ack', async({nodeId, signedPublicKey}) => {
            const node = this.network.node(nodeId)
            if (!node || !node.ecdh) throw new Error('handshake from unknown node')

            node.sessionKey = await this.verifyEcPublicKey(node.ecdh, node, signedPublicKey)
            node._sessionPromise.resolve(node.sessionKey)
            node._negotiating = false
            delete node._sessionPromise
            delete node.ecdh
        })


        // Node is identified on the network.
        this.app.on('sig11:network', ({edges, identity, nodes}) => {
            // Add the provider of this network as an endpoint,
            // because it has a transport.
            const endpoint = new Endpoint(this.network, identity, this.ws)
            this.network.addEndpoint(endpoint)
            // Import the remove network layout.
            this.network.import({edges, nodes})
            this.app.setState({sig11: {status: 'registered'}})
        })
    }


    _initialState() {
        return {
            enabled: true,
            endpoint: '', // process.env.SIG11_ENDPOINT,
            identity: {
                id: null,
                name: '',
                number: '',
                privateKey: null,
                publicKey: null,
            },
            network: {
                edges: [],
                nodes: [],
                view: false,
            },
            status: 'loading',
            toggled: true,
        }
    }


    connect() {
        // Close the connection and let the onClose event
        // do a new connection attempt.
        if (['connected', 'registered'].includes(this.app.state.sig11.status)) {
            this.disconnect()
            return
        }

        const endpoint = this.app.state.sig11.endpoint
        this.app.logger.info(`${this}connect to sig11 endpoint: ${endpoint}`)

        if (!endpoint.includes('ws://') && !endpoint.includes('wss://')) {
            this.ws = new WebSocket(`wss://${endpoint}`, 'sig11')
        } else {
            this.ws = new WebSocket(endpoint, 'sig11')
        }

        this.ws.onopen = this.onOpen.bind(this)
        this.ws.onclose = this.onClose.bind(this)
    }


    disconnect(reconnect = true) {
        this.reconnect = reconnect
        this.ws.close()
        delete this.ws
    }


    /**
     * Send an encrypted message across the SIG11
     * network to a node.
     * @param {String} nodeId - ID of the node to emit the message on.
     * @param {String} event - The event to emit.
     * @param {Object} payload - Payload to send.
     */
    async emit(nodeId, event, payload) {
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


    /**
     * Create a public key handshake to negotiate
     * a secure connection with.
     * @param {String} node - The Node to start the session with.
     * @returns {Promise} - Resolves when the AES secret is known.
     */
    async negotiateSession(node) {
        node._negotiating = true
        return new Promise(async(resolve, reject) => {
            node._sessionPromise = {reject, resolve}
            // Generate a transient ECDH keypair.
            node.ecdh = await crypto.subtle.generateKey({name: 'ECDH', namedCurve: 'P-256'}, true, ['deriveKey'])
            const signedPublicKeyRaw = await this.signEcPublicKey(node.ecdh)
            const signedPublicKey = this.app.crypto.__dataArrayToBase64(signedPublicKeyRaw)

            const data = await this.network.protocol.outRelay(node.id, 'session', {signedPublicKey})
            this.ws.send(data)
        })
    }


    onClose(event) {
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


    onOpen(event) {
        this.app.logger.debug(`${this}transport open`)
        this.app.setState({sig11: {status: 'connected'}})

        const identity = this.app.state.sig11.identity

        this.ws.send(this.network.protocol.out('identify', {
            headless: this.app.env.isNode,
            name: identity.name,
            number: identity.number,
            publicKey: identity.publicKey,
        }))

        this.ws.onmessage = this.onMessage.bind(this)
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
    * A representational name for this module for logging.
    * @returns {String} - An identifier for this module.
    */
    toString() {
        return `${this.app}[sig11] `
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

export default ModuleSIG11
