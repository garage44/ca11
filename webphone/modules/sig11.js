import CallSIG11 from '/sig11/call.js'
import ClientSIG11 from '/sig11/client.js'
import Module from '../lib/module.js'


class ModuleSIG11 extends Module {

    constructor(app) {
        super(app)

        // this.network = new Network(this.app)
        this.reconnect = true

        // Remote node signalled that the call is accepted.
        this.app.on('sig11:call-answer', ({answer, callId}) => {
            this.calls[callId].setupAnswer(answer)
        })


        this.app.on('sig11:call-candidate', ({callId, candidate}) => {
            // Only accept candidates for a valid call.
            if (!this.calls[callId]) return
            if (this.calls[callId].state.status === 'bye') return

            const pc = this.calls[callId].pc
            // The RTCPeerConnection is not available in the early
            // state of a call. Candidates are temporarily stored to
            // be processed when the RTCPeerConnection is made.
            if (pc && candidate) pc.addIceCandidate(new RTCIceCandidate(candidate))
            else {
                this.calls[callId].candidates.push(candidate)
            }
        })


        // An incoming call.
        this.app.on('sig11:call-offer', ({callId, nodeId, offer}) => {
            // const node = this.app.sig11.network.node(nodeId)
            const description = {direction: 'incoming', id: callId, node, offer}
            // For now, don't support call waiting and abandon the incoming
            // call when there is already a call going on.
            if (Object.keys(this.calls).length) {
                this.app.sig11.emit(nodeId, 'call-terminate', {callId, status: 'callee_busy'})
                return
            }

            const call = new CallSIG11(this.app, description)
            this.app.logger.info(`incoming call ${callId}:${nodeId}`)
            this.app.Vue.set(this.app.state.caller.calls, call.id, call.state)
            this.calls[call.id] = call

            call.incoming()
        })


        this.app.on('sig11:call-terminate', ({callId, status}) => {
            this.calls[callId].terminate(status, {remote: false})
        })

        this.app.on('ca11:services', async() => {
            if (!this.keypair) {
                let keypair
                if (this.app.state.sig11.identity.publicKey) {
                    keypair = await app.crypto.importIdentity(this.app.state.sig11.identity)
                } else {
                    keypair = await app.crypto.createIdentity()
                    const identity = await app.crypto.serializeKeypair(keypair)
                    this.app.setState({sig11: {identity}}, {persist: true})
                }

                // await this.network.setIdentity(keypair)
            }

            const enabled = this.app.state.sig11.enabled
            app.logger.debug(`sig11 ${enabled ? 'enabled' : 'disabled'}`)
            if (enabled) {
                this.connect()
            }
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
    }


    call(description) {
        // Search node that has the appropriate number.
        let node = this.app.sig11.network.filterNode({number: description.number})
        if (!node.length) return null
        description.node = node[0]

        return new CallSIG11(this.app, description)
    }
    async connect() {
        const domain = this.app.state.sig11.domain


        this.client = new ClientSIG11({domain})
        this.app.clients.sig11 = this.client

        this.client.on('connected', () => {
            this.app.logger.info(`connected with ${domain}`)
            this.app.setState({sig11: {status: 'connected'}})
            const identity = this.app.state.sig11.identity
            this.client.register(identity, this.app.env)
        })

        this.client.on('disconnected', (reconnect) => {
            this.app.setState({sig11: {status: 'disconnected'}})
            this.app.logger.debug(`transport closed (reconnect: ${reconnect})`)

        })

        this.client.connect()
    }


    state() {
        return {
            init: {
                domain: globalThis.env.domains.sig11,
                enabled: true,
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
            },
        }
    }
}

export default ModuleSIG11
