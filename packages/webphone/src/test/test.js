require('../src/js/vendor')
require('../src/js/i18n')

const {promisify} = require('util')
const path = require('path')

const c = require('ansi-colors')
const mkdirp = promisify(require('mkdirp'))
const puppeteer = require('puppeteer')
const test = require('tape-catch')


// Use the project directory as base directory.
const settings = require('../../../gulp/settings')(
    path.join(__dirname, '../../../'), 'test', path.join(__dirname, '../src'), {
        overrides: {
            // Force webview build modus.
            BUILD_TARGET: 'pwa',
        },
    },
)

// Force webview.
settings.BUILD_TARGET = 'pwa'
// Environment initialization.
settings.SCREENS = process.env.SCREENS ? true : false

// An environment flag may override the default headless setting.
if (process.env.HEADLESS) {
    settings.HEADLESS = process.env.HEADLESS === '1' ? true : false
} else settings.HEADLESS = settings.testing.headless

Object.assign(settings.testing, require('./accounts.json'))


if (process.env.CI_ALICE_SIP_PASSWORD) {
    for (const actor of ['alice', 'bob', 'charlie']) {
        settings.testing[actor].sip.password = process.env[`CI_${actor.toUpperCase()}_SIP_PASSWORD`]
    }
}


const lib = {
    delay: (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    },
    getText: async({page}, selector) => {
        return await page.$eval(selector, el => el.innerText)
    },
    /**
    * Each test user has its own browser.
    * @param {String} name - Name of the testrunner.
    * @param {Object} options - Options to pass to the runner.
    * @returns {Object} - Browser and pages.
    */
    init: async(name, options) => {
        let browser = await puppeteer.launch({
            args: [
                '--disable-notifications',
                '--disable-web-security',
                '--hide-scrollbars',
                '--ignore-certificate-errors',
                '--no-sandbox',
                '--use-fake-ui-for-media-stream',
                '--use-fake-device-for-media-stream',
            ],
            executablePath: process.env.OVERRIDE_CHROMIUM_PATH,
            headless: settings.HEADLESS,
            pipe: true,
        })

        let pages = await browser.pages()
        // Default viewport size during tests.
        pages[0].setViewport({height: 600, width: 500})
        const uri = 'https://dev.ca11.app/index.html?mode=test'
        await pages[0].goto(uri, {})

        const actor = {browser, page: pages[0]}
        // Assign test credentials to actor.
        Object.assign(actor, settings.testing[name])

        lib.actors[name] = actor
        return actor
    },
    /**
    * Take a screenshot of `browser` and write it to file.
    * @param {Object} actor - A test actor object.
    * @param {String} name - Name the screenshot (actor name will be prepended).
    * @param {Object} options - Extra screenshot options.
    * @param {String} options.scope - Puppeteer scoped element container.
    * @param {String} options.subject - Subject for in the screenshot name.
    * @param {String} options.unique - Don't make the same named screenshot again.
    */
    screenshot: async(actor, name, {only = null, scope = null, unique = true} = {}) => {
        if (only && only !== actor.session.username) return
        if (unique && lib.screenshots[name]) return

        lib.screenshots[name] = true

        // Make a screenshot of the app container without scope.
        if (!scope) scope = actor.page

        if (settings.SCREENS) {
            await mkdirp(settings.SCREENS_DIR)
            let filename = `${actor.session.username}-${name}.png`

            const screenshotPath = path.join(settings.SCREENS_DIR, filename)
            await scope.screenshot({path: screenshotPath})
        }
    },

    settings,
    /**
    * Report a test step of `actor`.
    * When not in HEADLESS mode, it will also pause for 2 seconds.
    * @param {String} actor - The test actor.
    * @param {String} message - Step message to print.
    * @param {String} context - Step context to print.
    */
    step: async(actor, message, context = '') => {
        let prefix

        prefix = actor.session.username.padEnd(7)
        if (context) context = c.italic(` <${context}>`)
        if (actor.session.username === 'alice') prefix = c.cyan(prefix)
        else if (actor.session.username === 'bob') prefix = c.magenta(prefix)
        else if (actor.session.username === 'charlie') prefix = c.yellow(prefix)
        // eslint-disable-next-line no-console
        console.log(`${prefix}${context} ${c.grey(message)}`)
        if (settings.DEBUG_MODE) {
            await new Promise(resolve => setTimeout(resolve, 2000))
        }
    },
    test,
    /**
     * Perform a async tape test.
     * This function will automatically call `t.end` when the test body is done.
     * It also provides an `onExit` hook to register handlers that will be called
     * when the test is done (irregardless of failure or success).
     * Finally it will catch exceptions in the async test body and report them and
     * fail the tape test.
     * @param {String} title - Test title.
     * @param {AsyncFunction} func - Test body.
     * @returns {Tape} - Tape test case
     */
    testAsync: (title, func) => {
        const cleanup = []
        const onExit = (f) => cleanup.push(f)
        return test(title, async(t) => {
            try {
                await func(t, onExit)
                t.end()
            } catch (e) {
                throw e
            } finally {
                if (!settings.DEBUG_MODE) {
                    for (const actor of Object.values(lib.actors)) {
                        await actor.browser.close()
                    }
                }
                for (const f of cleanup) {
                    await f()
                }
            }
        })
    },
}

lib.actors = {}
lib.screenshots = {}

lib.steps = {
    call: require('./browser/steps/call')(lib),
    meta: require('./browser/steps/meta')(lib),
    session: require('./browser/steps/session')(lib),
    settings: require('./browser/steps/settings')(lib),
    wizard: require('./browser/steps/wizard')(lib),
}

export default lib
