import EventEmitter from 'eventemitter3'


class Module extends EventEmitter {

    constructor(app) {
        super(app)
        this.app = app
    }
}

export default Module
