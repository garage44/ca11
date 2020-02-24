import EventEmitter from 'eventemitter3'

/**
 * Generic base class for each module. Modules can be used in
 * AppBackground and AppForeground to seperate logical blocks
 * of functionality from each other and to keep everything clear.
 */
class Module extends EventEmitter {
    /**
     * Base Module constructor.
     * @param {AppBackground} app - The background application.
     */
    constructor(app) {
        super(app)
        this.app = app
    }
}

export default Module
