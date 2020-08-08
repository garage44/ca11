import App from '@ca11/webphone/lib/app.js'
import btoa from 'btoa'
import Crypto from './lib/crypto.js'
import Endpoint from './server/endpoint.js'
import EventEmitter from 'eventemitter3'
import fs from 'fs-extra'
import http from 'http'
import knex from 'knex'
import Network from './server/network.js'
import path from 'path'
import rc from 'rc'
import WebCrypto from 'node-webcrypto-ossl'
import WebSocket from 'ws'

global.EventEmitter = EventEmitter
global.btoa = btoa

global.crypto = new WebCrypto()

let settings


class Sig11Service extends App {

    constructor() {
        super(settings)

        this.crypto = new Crypto(this)
        this.network = new Network(this)

        this.knex = knex(settings.knex)
        this.setup()
    }


    async onConnection(ws) {
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

        endpoint.once('sig11:identified', this.onIdentify.bind(this, endpoint))

        ws.on('close', () => {
            this.network.removeEndpoint(endpoint)
            const msg = this.network.protocol.out('node-removed', endpoint.serialize())
            this.network.broadcast(msg)
        })
    }


    async onIdentify(endpoint) {
        // SIP entity is a hash of the public key.
        const rows = await this.knex.from('sig11_asterisk').select('*').where({
            pubkey: endpoint.id,
        })

        if (!rows.length) {
            const sipId = endpoint.number
            await Promise.all([
                this.knex('sig11_asterisk').insert({
                    id: sipId,
                    pubkey: endpoint.id,
                }),
                this.knex('ps_aors').insert({
                    id: sipId,
                    max_contacts: 1,
                }),
                this.knex('ps_auths').insert({
                    auth_type: 'userpass',
                    id: sipId,
                    password: sipId,
                    username: sipId,
                }),
                this.knex('ps_endpoints').insert({
                    allow: 'opus,h264,vp8',
                    aors: sipId,
                    auth: sipId,
                    bundle: 'yes',
                    context: 'default',
                    direct_media: 'no',
                    disallow: 'all',
                    id: sipId,
                    max_audio_streams: 10,
                    max_video_streams: 10,
                    send_pai: 'yes',
                    transport: 'transport-wss',
                    webrtc: 'yes',
                }),
            ])

            endpoint.send(this.network.protocol.out('services', {
                sip: {
                    account: {
                        password: sipId,
                        username: sipId,
                    },
                },
            }))
        }

        this.network.addEndpoint(endpoint, this.network.identity)
        endpoint.send(this.network.protocol.out('network', this.network.export()))

        const msg = this.network.protocol.out('node-added', {
            node: endpoint.serialize(),
            parent: this.network.identity,
        })
        // Notify others about the new node.
        this.network.broadcast(msg, {excludes: [endpoint]})
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
        this.server.listen(settings.port, () => [
            this.logger.info(`listening on port ${settings.port}`),
        ])
    }


    toString() {
        return '[sig11] '
    }
}

(async() => {
    const defaultsTarget = path.join(path.dirname(new URL(import.meta.url).pathname), '.sig11rc.defaults')
    const defaults = JSON.parse(await fs.readFile(defaultsTarget, 'utf8'))
    settings = rc('sig11', defaults)
    global.sig11 = new Sig11Service()
})()


