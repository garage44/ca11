const fs = require('fs').promises
const util = require('util')
const glob = util.promisify(require('glob'))

const _ = require('../test')

const {CA11, options} = require('../../src/js')
const BRAND = process.env.BRAND ? process.env.BRAND : 'ca11'


let translations = []

async function getTranslations() {
    let globPattern = '{src/js/**/*.js,src/components/**/{*.js,*.vue}'
    const plugins = _.settings.brands[BRAND].plugins

    if (plugins.builtin.contacts.providers.length) {
        for (const provider of plugins.builtin.contacts.providers) {
            globPattern += `,node_modules/${provider}/src/**/{*.js,*.vue}`
        }
    }

    if (Object.keys(plugins.custom).length) {
        for (const name of Object.keys(plugins.custom)) {
            globPattern += `,node_modules/${plugins.custom[name].name}/src/**/{*.js,*.vue}`
        }
    }

    globPattern += '}'
    const files = await glob(globPattern)
    const translationMatch = /\$t\([\s]*'([a-zA-Z0-9_\s{}.,!?%\-:;"]+)'[(\),)?]/g
    const unescape = /\\/g

    for (const filename of files) {
        const data = await (await fs.readFile(filename)).toString('utf8')
        data.replace(translationMatch, function(pattern, $t) {
            $t = $t.replace(unescape, '')
            translations.push($t)
        })
    }
    return translations
}


/**
 * This test detects redundant and missing translations.
 * Also takes plugins into account.
 */
_.test('[parts] i18n: translations missing', async function(t) {
    t.plan(1)
    if (!translations.length) translations = await getTranslations()

    const ca11 = new CA11(options)

    let missing = []

    for (const translation of translations) {
        if (!(translation in ca11.i18n.translations.nl)) {
            missing.push(translation)
        }
    }

    t.notOk(missing.length, 'translations missing')
    if (missing.length) t.comment(`affected: \r\n${missing.join('\r\n')}`)
})


_.test('[parts] i18n: translations redundant', async function(t) {
    t.plan(1)
    if (!translations.length) translations = await getTranslations()
    const ca11 = new CA11(options)

    let redundant = []
    // Check if we have translations that are not defined; i.e. that are redundant.
    for (const translation of Object.keys(ca11.i18n.translations.nl)) {
        if (!(translations.includes(translation))) {
            redundant.push(translation)
        }
    }

    t.notOk(redundant.length, 'translations redundant')
    if (redundant.length) t.comment(`affected: \r\n${redundant.join('\r\n')}`)
})


_.test('[parts] i18n: translations all lower case', async function(t) {
    t.plan(1)
    if (!translations.length) translations = await getTranslations()
    let faultyUppercase = []

    for (const translation of translations) {
        // All translations must start with lower case.
        if ((translation[0] !== translation[0].toLowerCase() &&
            translation[1] !== translation[1].toUpperCase()
        )) {
            faultyUppercase.push(translation)
        }
    }

    t.notOk(faultyUppercase.length, 'translations are not lower-case')
    if (faultyUppercase.length) t.comment(`affected: \r\n${faultyUppercase.join('\r\n')}`)
})
