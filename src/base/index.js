const Logger = require('./logger')
const Utils = require('./utils')
const EventEmitter = require('eventemitter3')


/**
* This is the minimal class that all runnable parts of the Ca11
* application inherit from. It sets some basic properties that
* can be reused, like a logger, an IPC eventemitter and
* some environmental properties.
* @memberof app
*/
class Skeleton extends EventEmitter {

    constructor(settings) {
        super(settings)

        this.env = require('./env')()

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
        if (process.env.BUILD_VERBOSE === true) this.verbose = true
        else this.verbose = false
    }


    /**
    * Generate a representational name for this module. Used for logging.
    * @returns {String} - An identifier for this module.
    */
    toString() {
        return `[${this.constructor.name}] `
    }
}

module.exports = Skeleton
