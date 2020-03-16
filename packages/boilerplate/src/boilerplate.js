import env from './env.js'
import Logger from './logger.js'
import Utils from './utils.js'

import EventEmitter from 'eventemitter3'

// FIXME: shortid replacement
globalThis.shortid = function() {
    var result           = ''
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length
    for ( var i = 0; i < 6; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}


export class Skeleton extends EventEmitter {

    constructor(settings) {
        super(settings)

        this.env = env()

        this._listeners = 0
        this.utils = new Utils()
        this.logger = new Logger(this)

        // Sets the verbosity of the logger.
        if (process.env.NODE_ENV === 'production') {
            this.logger.setLevel('info')
        } else {
            this.logger.setLevel('debug')
        }
        // Increases verbosity beyond the logger's debug level. Not
        // always useful during development, so it has to be switched
        // on manually.
        this.verbose = false
    }

    toString() {
        return `[${this.constructor.name}] `
    }
}

export {env}