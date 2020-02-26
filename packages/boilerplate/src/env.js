/** @memberof lib */
/**
* Simple environment detection for the DOM and JavaScript.
* Ca11 tries to be environment-agnostic, but sometimes
* a condition needs to be made, based on the current environment
* the code runs in.
* @module env
*/

/**
* Call this method in the script context to get
* the context back as an object.
* @returns {Object} - Environment-specific flags.
*/
function env() {
    let _env = {
        isAndroid: false,
        isBrowser: false,
        isChrome: false,
        isElectron: false,
        isFirefox: false,
        isLinux: false,
        isMacOS: false,
        isNode: false,
        isStandalone: false,
        isTel: false,
        isTest: false,
        isWindows: false,
        name: 'unknown',
    }

    let ua

    if (globalThis.document) {
        ua = navigator.userAgent.toLowerCase()
        _env.isAndroid = ua.includes('android')

        if (ua.includes('edge')) {
            _env.isEdge = true
            _env.name = 'edge'
        } else if (ua.includes('firefox')) {
            _env.isFirefox = true
            _env.name = 'firefox'
        } else if (ua.includes('chrome')) {
            _env.isChrome = true
            _env.name = 'chrome'
        }
    } else {
        _env.isNode = true
        _env.name = 'node'
    }

    if (globalThis.navigator) {
        _env.isBrowser = true

        if (navigator.platform.match(/(Linux)/i)) _env.isLinux = true
        else if (navigator.platform.match(/(Mac)/i)) _env.isMacOS = true
        else if (navigator.platform.match(/(Windows|Win32)/i)) _env.isWindows = true

        const search = decodeURIComponent(location.search)
        if (search.includes('mode=test')) {
            _env.isTest = true
            $('html').classList.add('test')
        } else if (search.includes('mode=standalone')) {
            _env.isStandalone = true
            $('html').classList.add('standalone')
        } else if (search.includes('tel:')) {
            _env.isTel = search.replace('?tel:', '')
            history.replaceState({}, null, '/')
        }

        if (_env.isChrome) $('html').classList.add('chrome')
        if (_env.isEdge) $('html').classList.add('edge')
        if (_env.isFirefox) $('html').classList.add('firefox')
        if (_env.isAndroid) $('html').classList.add('android')
    }

    try {
        // Skip electron from transpilation.
        let electronNamespace = 'electron'
        window.electron = require(electronNamespace)
        _env.isElectron = true
        $('html').classList.add('electron')
    } catch (e) {
        // Catch reference errors.
    }

    return _env
}


export default env
