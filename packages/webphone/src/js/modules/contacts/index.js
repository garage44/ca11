/**
* Contacts plugin takes care of managing
* Contacts, Endpoints and Presence.
* @memberof AppBackground.plugins
*/
class ModuleContacts extends Module {
    /**
    * @param {AppBackground} app - The background application.
    */
    constructor(app) {
        super(app)

        this.subscriptions = {}
        this.presence = {
            sig11: require('./presence/sig11')(app, this),
            sip: require('./presence/sip')(app, this),
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


    /**
    * Initializes the module's store.
    * @returns {Object} The module's store properties.
    */
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


    /**
    * Reset the state of a contact endpoint before
    * updating it.
    */
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


    /**
    * Subscribe all endpoints with subscription indication
    * or to all endpoints when using override.
    * @param {Boolean} override - Override endpoint subscription indication.
    */
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


    /**
    * Generate a representational name for this module. Used for logging.
    * @returns {String} - An identifier for this module.
    */
    toString() {
        return `${this.app}[contacts] `
    }


    unsubscribe(contact, endpoint) {
        if (endpoint.protocol === 'sip') {
            this.app.logger.info(`${this}unsubscribe sip endpoint ${endpoint.number}`)
            this.presence.sip.unsubscribe(contact, endpoint)
        }
    }


    /**
    * Unsubscribe all endpoints with subscription indication
    * or from all endpoints when using override.
    * @param {Boolean} override - Override endpoint subscription indication.
    */
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

module.exports = ModuleContacts
