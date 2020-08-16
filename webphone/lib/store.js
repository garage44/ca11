class MemoryStore {
    constructor() {
        this.data = {}
    }

    getItem(key) {
        return this.data[key]
    }

    removeItem(key) {
        delete this.data[key]
    }

    setItem(key, value) {
        this.data[key] = value
    }
}


class StateStore {

    constructor(app) {
        this.app = app
        this._writeState = []
        this.schema = 1

        this.cache = {
            encrypted: {},
            unencrypted: {},
        }

        if (this.app.env.isBrowser) {
            this.store = localStorage
        } else {
            this.store = new MemoryStore()
        }
    }


    clear() {
        let keys
        if (this.app.env.isNode) keys = Object.keys(this.store.data)
        else keys = this.store
        for (const key in keys) {
            if (this.store.getItem(key) && key !== 'schema') this.remove(key)
        }
    }


    get(key) {
        if (this.app.verbose) this.app.logger.debug(`get value for key '${key}'`)
        var value = this.store.getItem(key)
        if (value) {
            return JSON.parse(value)
        }
        return null
    }


    processQueue(newTask) {
        if (newTask) this._writeState.push(newTask)
        if (this._writeState.length) {
            // Only fire an action once per call.
            let actionStarted = false
            for (const item of this._writeState) {
                if (item.status === 0 && !actionStarted) {
                    actionStarted = true
                    item.action(item)
                } else if (this._writeState[0].status === 2) {
                    this._writeState.shift()
                }
            }
        }
    }


    remove(key) {
        if (this.get(key)) this.store.removeItem(key)
    }


    reset() {
        this.store.clear()
    }


    set(key, value) {
        this.store.setItem(key, JSON.stringify(value))
    }


    valid() {
        let schema = this.get('schema')
        if (schema === null || schema !== this.schema) {
            this.set('schema', this.schema)
            this.app.logger.warn(`${this}store schema changed! db: ${schema} state: ${this.schema}`)
            if (schema === null) return null
            else return false
        }

        return true
    }


    async writeEncrypted({item, resolve}) {
        item.status = 1
        const storeEndpoint = this.app.state.app.session.active
        if (!storeEndpoint) return

        let storeState = await this.app.crypto.encrypt(
            this.app.crypto.vaultKey,
            JSON.stringify(this.cache.encrypted),
        )
        this.set(`${storeEndpoint}/state/vault`, storeState)
        item.status = 2
        // Process the next queue item in case other
        // write actions were added in the meantime.
        resolve()
        this.processQueue()
    }
}

export default StateStore
