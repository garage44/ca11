import Module from '../../lib/module.js'

import Sig11Presence from './presence/sig11.js'
import SipPresence from './presence/sig11.js'


class ModuleContacts extends Module {

    constructor(app) {
        super(app)

        this.subscriptions = {}
        this.presence = {
            sig11: Sig11Presence(app, this),
            sip: SipPresence(app, this),
        }

        // Start subscribing to presence info after being registered.
        this.app.on('core:sip:registered', () => {
            this.subscribeAll()
        })

        this.app.on('contacts:subscribe', ({contact, endpoint}) => this.subscribe(contact, endpoint))
        this.app.on('contacts:subscribe-all', () => this.subscribeAll(true))
        this.app.on('contacts:unsubscribe', ({contact, endpoint}) => this.unsubscribe(contact, endpoint))
        this.app.on('contacts:unsubscribe-all', () => this.unsubscribeAll(true))
    }


    _initialState() {
        return {
            contacts: {
                a0000001: {
                    endpoints: {
                        aa000001: {
                            id: 'aa000001',
                            number: '1111',
                            protocol: 'sip',
                            pubkey: '',
                            status: 'not-set',
                            subscribe: false,
                        },
                    },
                    favorite: false,
                    id: 'a0000001',
                    name: 'Welcome tape',
                    selected: false,
                },
                a0000002: {
                    endpoints: {
                        aa000001: {
                            id: 'aa000001',
                            number: '2222',
                            protocol: 'sip',
                            pubkey: '',
                            status: 'not-set',
                            subscribe: false,
                        },
                    },
                    favorite: false,
                    id: 'a0000002',
                    name: 'Conference (SFU)',
                    selected: false,
                },
                a0000003: {
                    endpoints: {
                        aa000001: {
                            id: 'aa000001',
                            number: '3333',
                            protocol: 'sip',
                            pubkey: '',
                            status: 'not-set',
                            subscribe: false,
                        },
                    },
                    favorite: false,
                    id: 'a0000003',
                    name: 'DTMF test',
                    selected: false,
                },
            },
            filters: {
                favorites: false,
                presence: false,
            },
            status: null,
        }
    }


    _ready() {
        this.state = this.app.state.contacts
    }


    resetEndpointsStatus() {
        for (const contact of Object.values(this.state.contacts)) {
            for (const endpoint of Object.values(contact.endpoints)) {
                this.app.setState({status: 'not-set'}, {
                    action: 'upsert',
                    path: `contacts.contacts.${contact.id}.endpoints.${endpoint.id}`,
                    persist: true,
                })
            }
        }
    }


    subscribe(contact, endpoint) {
        if (endpoint.protocol === 'sip') {
            this.app.logger.info(`${this}subscribe sip endpoint ${endpoint.number}`)
            this.presence.sip.subscribe(contact, endpoint)
        }
    }


    subscribeAll(override = false) {
        this.resetEndpointsStatus()
        this.app.logger.info(`${this}updating contact endpoint presence status`)
        for (const contact of Object.values(this.state.contacts)) {
            for (const endpoint of Object.values(contact.endpoints)) {
                if (endpoint.subscribe || override) {
                    this.presence.sip.subscribe(contact, endpoint)
                }
            }
        }
    }


    toString() {
        return `${this.app}[mod-contacts] `
    }


    unsubscribe(contact, endpoint) {
        if (endpoint.protocol === 'sip') {
            this.app.logger.info(`${this}unsubscribe sip endpoint ${endpoint.number}`)
            this.presence.sip.unsubscribe(contact, endpoint)
        }
    }


    unsubscribeAll(override = false) {
        for (const contact of Object.values(this.state.contacts)) {
            for (const endpoint of Object.values(contact.endpoints)) {
                if (endpoint.subscribe || override) {
                    this.presence.sip.unsubscribe(contact, endpoint)
                }
            }
        }
    }
}

export default ModuleContacts
