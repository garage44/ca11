// require('../src/js/vendor')
// require('../src/js/i18n')

import _mkdirp from 'mkdirp'
import c from 'chalk'
import fs from 'fs-extra'
import path from 'path'
import {promisify} from 'util'
import puppeteer from 'puppeteer'
import settings from '../../../lib/settings.js'
import stepCall from './browser/steps/call.js'
import stepMeta from './browser/steps/meta.js'
import stepSession from './browser/steps/session.js'
import stepSettings from './browser/steps/settings.js'
import stepWizard from './browser/steps/wizard.js'
import test from 'tape-catch'

const mkdirp = promisify(_mkdirp)

// Environment initialization.
settings.SCREENS = process.env.SCREENS ? true : false

// An environment flag may override the default headless setting.
if (process.env.HEADLESS) {
    settings.HEADLESS = process.env.HEADLESS === '1' ? true : false
} else settings.HEADLESS = settings.testing.headless


if (process.env.CI_ALICE_SIP_PASSWORD) {
    for (const actor of ['alice', 'bob', 'charlie']) {
        settings.testing[actor].sip.password = process.env[`CI_${actor.toUpperCase()}_SIP_PASSWORD`]
    }
}


/**
 * Customized tape test class providing boilerplate
 * code for browser tests and async tests.
 */
class DuckTape {

    constructor(settings) {
        this.steps = {
            call: stepCall(this),
            meta: stepMeta(this),
            session: stepSession(this),
            settings: stepSettings(this),
            wizard: stepWizard(this),
        }

        // Tape-catch
        this.test =  test

        this.actors = {}
        this.screenshots = {}
        this.settings = settings
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    async getText({page}, selector) {
        return await page.$eval(selector, el => el.innerText)
    }

    /**
    * Each test user has its own browser.
    * @param {String} name - Name of the testrunner.
    * @returns {Object} - Browser and pages.
    */
    async init(name) {
        let browser = await puppeteer.launch({
            args: [
                '--disable-notifications',
                '--disable-web-security',
                '--hide-scrollbars',
                '--ignore-certificate-errors',
                '--no-sandbox',
                '--use-fake-ui-for-media-stream',
                '--use-fake-device-for-media-stream',
                '--enable-experimental-web-platform-features',
            ],
            executablePath: process.env.OVERRIDE_CHROMIUM_PATH,
            headless: settings.HEADLESS,
            pipe: true,
        })


        const accounts = await fs.readJSON(path.join(settings.dir.base, 'packages', 'webphone', 'test', './accounts.json'))
        let pages = await browser.pages()
        // Default viewport size during tests.
        pages[0].setViewport({height: 800, width: 600})
        const uri = 'https://dev.ca11.app/index.html?mode=test'
        await pages[0].goto(uri, {})


        const actor = {browser, page: pages[0]}
        // Assign test credentials to actor.
        Object.assign(actor, accounts[name])
        this.actors[name] = actor
        return actor
    }

    /**
    * Take a screenshot of `browser` and write it to file.
    * @param {Object} actor - A test actor object.
    * @param {String} name - Name the screenshot (actor name will be prepended).
    * @param {Object} options - Extra screenshot options.
    * @param {String} options.scope - Puppeteer scoped element container.
    * @param {String} options.subject - Subject for in the screenshot name.
    * @param {String} options.unique - Don't make the same named screenshot again.
    */
    async screenshot(actor, name, {only = null, scope = null, unique = true} = {}) {
        if (only && only !== actor.session.username) return
        if (unique && this.screenshots[name]) return

        this.screenshots[name] = true

        // Make a screenshot of the app container without scope.
        if (!scope) scope = actor.page

        if (settings.SCREENS) {
            await mkdirp(settings.SCREENS_DIR)
            let filename = `${actor.session.username}-${name}.png`

            const screenshotPath = path.join(settings.SCREENS_DIR, filename)
            await scope.screenshot({path: screenshotPath})
        }
    }


    /**
    * Report a test step of `actor`.
    * When not in HEADLESS mode, it will also pause for 2 seconds.
    * @param {String} actor - The test actor.
    * @param {String} message - Step message to print.
    * @param {String} context - Step context to print.
    */
    async step(actor, message, context = '') {
        let prefix

        prefix = actor.session.username.padEnd(7)
        if (context) context = c.italic(` <${context}>`)
        if (actor.session.username === 'alice') prefix = c.cyan(prefix)
        else if (actor.session.username === 'bob') prefix = c.magenta(prefix)
        else if (actor.session.username === 'charlie') prefix = c.yellow(prefix)
        // eslint-disable-next-line no-console
        console.log(`${prefix}${context} ${c.grey(message)}`)
        if (settings.debugMode) {
            await new Promise(resolve => setTimeout(resolve, 2000))
        }
    }

    /**
     * Perform a async tape test.
     * @param {String} title - Test title.
     * @param {AsyncFunction} func - Test body.
     * @returns {Tape} - Tape test case
     */
    testAsync(title, func) {
        return test(title, async(t) => {
            try {
                await func(t)
            } catch (err) {
                console.error(err)
                throw(err)
            } finally {
                if (!this.settings.debugMode) {
                    for (const actor of Object.values(this.actors)) {
                        await actor.browser.close()
                    }
                }
                t.end()
            }
        })
    }
}

const duckTape = new DuckTape(settings)


export default duckTape
