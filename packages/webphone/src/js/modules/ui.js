/**
* This module is responsible for handling all UI-related
* state and respond with UI-specific calls to watchers.
* @module ModuleUI
*/
class PluginUI extends Module {
    /**
    * Setup some menubar and click-to-dial icon related properties.
    * @param {AppBackground} app - The background application.
    */
    constructor(app) {
        super(app)
        this.animationStep = 0
        // Used to restore the Click-to-dial icon label message when
        // a tab refreshes and a call is still ongoing.
        this.lastLabelMessage = null
    }


    /**
    * Initializes the module's store.
    * @returns {Object} The module's store properties.
    */
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


    /**
    * Create a system notification. The type used depends on the OS. Linux
    * uses inotify by default. Note that we can't use buttons here, because
    * that would require a service-worker implementation.
    * @param {Object} opts - Notification options.
    * @param {Boolean} opts.force - Force to show the notification.
    * @param {String} opts.message - Message body for the notification.
    * @param {String} [opts.number] - Number is used to target specific click-to-dial labels.
    * @param {String} opts.title - Title header for the notification.
    * @param {Boolean} [opts.stack] - Whether to stack the notifications.
    */
    notification({force = false, message, number = null, title, stack = false, timeout = 3000}) {
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
        if (!('Notification' in global)) return

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

module.exports = PluginUI
