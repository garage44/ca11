const http = require('http')
const WebCrypto = require('node-webcrypto-ossl')

global.crypto = new WebCrypto()

const Skeleton = require('../base')

const Crypto = require('../sig11/crypto')
const Endpoint = require('../sig11/endpoint')
const Network = require('../sig11/network')

global.EventEmitter = require('eventemitter3')
global.btoa = require('btoa')
const WebSocket = require('ws')

const uuidv4 = require('uuid/v4')

const rc = require('rc')
let settings = {}
rc('ca11', settings)

class Ca11Tower extends Skeleton {

    constructor() {
        super()

        this.crypto = new Crypto(this)
        this.network = new Network(this)

        this.knex = require('knex')(settings.tower.knex)

        this.setup()
    }


    async onConnection(ws, req) {
        const endpoint = new Endpoint(this.network, {}, ws)

        // Transport data handler.
        ws.on('message', async(msg) => {
            try {
                msg = JSON.parse(msg)
            } catch (err) {
                return
            }
            if (msg.length === 3) {
                await this.network.protocol.in(msg, endpoint)
            } else if (msg.length === 4) {
                this.network.protocol.inRelay(msg, endpoint)
            }
        })

        endpoint.once('sig11:identified', async() => {
            // SIP entity is a hash of the public key.
            const rows = await this.knex.from('sig11_asterisk').select('*').where({
                pubkey: endpoint.id,
            })

            if (!rows.length) {
                this.knex('sig11_asterisk').insert({
                    id: uuidv4(),
                    pubkey: endpoint.id,
                })
                    .then((res) => {
                        // console.log('RES', res)
                    })
            }


            this.network.addEndpoint(endpoint, this.network.identity)
            endpoint.send(this.network.protocol.out('network', this.network.export()))

            const msg = this.network.protocol.out('node-added', {
                node: endpoint.serialize(),
                parent: this.network.identity,
            })
            // Notify others about the new node.
            this.network.broadcast(msg, {excludes: [endpoint]})
        })

        ws.on('close', () => {
            this.network.removeEndpoint(endpoint)
            const msg = this.network.protocol.out('node-removed', endpoint.serialize())
            this.network.broadcast(msg)
        })
    }
    async setup() {
        this.keypair = await this.crypto.createIdentity()
        this.network.setIdentity(this.keypair)

        this.server = http.createServer()
        this.wss = new WebSocket.Server({
            disableHixie: true,
            perMessageDeflate: false,
            protocolVersion: 17,
            server: this.server,
        })

        this.wss.on('connection', this.onConnection.bind(this))
        this.server.listen(settings.tower.port)
    }


}

global.ca11tower = new Ca11Tower()
