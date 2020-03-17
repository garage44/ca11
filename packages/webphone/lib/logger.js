/**
 * A thin wrapper around the native console that makes it possible to set
 * loglevels. Use source blacklisting and sourcemaps to get to the
 * original error.
 * @memberof lib
 */
class Logger {

    constructor(app) {
        this.app = app
        this.levels = {
            debug: 4,
            error: 0,
            info: 2,
            verbose: 3,
            warn: 1,
        }

        this.id = 0
        this._notification = null
    }


    debug(...args) {
        if (this.level >= this.levels.debug) {
            if (this.app.env.isBrowser) {
                args[0] = `%c${args[0]}`
                args.push('color: #999')
            }
            // eslint-disable-next-line no-console
            console.log(...args)
        }
    }


    error(...args) {
        // eslint-disable-next-line no-console
        console.error(...args)
    }


    group(name) {
        // eslint-disable-next-line no-console
        console.group(name)
    }


    groupEnd() {
        // eslint-disable-next-line no-console
        console.groupEnd()
    }


    info(...args) {
        if (this.level >= this.levels.info) {
            // eslint-disable-next-line no-console
            console.info(...args)
        }
    }


    setLevel(level) {
        this.level = this.levels[level]
    }


    verbose(...args) {
        if (this.level >= this.levels.verbose) {
            // eslint-disable-next-line no-console
            console.log(...args)
        }
    }


    warn(...args) {
        if (this.level >= this.levels.warn) {
            // eslint-disable-next-line no-console
            console.warn(...args)
        }
    }
}

export default Logger
