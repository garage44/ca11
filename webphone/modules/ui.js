import Module from '../lib/module.js'

class PluginUI extends Module {

    constructor(app) {
        super(app)
        this.animationStep = 0
        // Used to restore the Click-to-dial icon label message when
        // a tab refreshes and a call is still ongoing.
        this.lastLabelMessage = null
    }


    _initialState() {
        return {
            layer: 'login',
            menubar: {
                base: 'inactive',
                event: null,
            },
            overlay: null,
            tabs: {
                settings: {
                    active: 'general',
                },
            },
            theme: 'default-dark',
            visible: false,
        }
    }


    _ready() {
        let state = {ui: {visible: true}}
        this.app.setState(state)
    }


    notification({message, title, stack = false, timeout = 3000}) {
        if (this.app.env.isNode || this.app.env.isAndroid) return

        const options = {
            message: message,
            title: title,
            type: 'basic',
        }
        options.iconUrl = 'img/notification.png'
        options.icon = options.iconUrl
        options.body = message

        // Notification API may be disabled during tests or when running in Node.
        if (!('Notification' in globalThis)) return

        if (Notification.permission === 'granted') {
            if (!stack && this._notification) this._notification.close()
            this._notification = new Notification(title, options) // eslint-disable-line no-new
            setTimeout(() => this._notification.close(), timeout)
        } else if (Notification.permission !== 'denied') {
            // Create a notification after the user
            // accepted the permission.
            Notification.requestPermission((permission) => {
                if (permission === 'granted') {
                    this._notification = new Notification(title, options) // eslint-disable-line no-new
                    setTimeout(() => this._notification.close(), timeout)
                }
            })
        }
    }

}

export default PluginUI
