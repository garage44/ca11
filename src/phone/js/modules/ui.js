/**
* This module is responsible for handling all UI-related
* state and respond with UI-specific calls to watchers.
* @module ModuleUI
*/
class PluginUI extends Plugin {
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
    * Set the menubar icon in environments with
    * a menubar icon (Electron).
    * @param {String} name - The name of the menubar png to set.
    */
    __menubarIcon(name) {}


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
            theme: 'default-light',
            visible: false,
        }
    }


    _ready() {
        this.__menubarIcon(this.app.state.ui.menubar.base)
        let state = {ui: {visible: true}}

        this.app.setState(state)
    }


    /**
    * Restore stored dumped state from localStorage.
    * The menubar should be inactive without any overriding events.
    * @param {Object} moduleStore - Root property for this module.
    */
    _restoreState(moduleStore) {
        moduleStore.menubar = {
            base: 'inactive',
            event: null,
        }
    }


    /**
    * Deal with menubar icon changes made to the store in
    * an environment-specific way.
    * @returns {Object} The store properties to watch.
    */
    _watchers() {
        return {
            'store.ui.menubar.base': (menubarIcon) => {
                this.__menubarIcon(menubarIcon)
            },
        }
    }


    /**
    * Restore the menubar to a valid state. This is for instance needed
    * when switching off a state like dnd or a selected queue.
    * @param {String} [base] -
    */
    menubarState(base = null) {
        const sipStatus = this.app.state.sip.status

        if (base) {
            this.app.setState({ui: {menubar: {base}}})
            return
        }

        // Generic menubar behaviour.
        if (this.app.state.app.session.active && !this.app.state.session.authenticated) {
            base = 'lock'
        } else if (!this.app.state.session.authenticated) base = 'inactive'
        else if (sipStatus === 'disconnected') base = 'disconnected'
        else {
            if (sipStatus === 'registered') {
                if (this.app.state.app.dnd) base = 'dnd'
                else base = 'active'
            } else base = 'disconnected'
        }

        // Modules can override the generic menubar behaviour using
        // a custom `_menubarState` method.
        for (let moduleName of Object.keys(this.app.modules)) {
            if (this.app.modules[moduleName]._menubarState) {
                const moduleMenubarState = this.app.modules[moduleName]._menubarState()
                if (moduleMenubarState) base = moduleMenubarState
            }
        }
        this.app.setState({ui: {menubar: {base}}})
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
