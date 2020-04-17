const I18n = require('ca11/lib/i18n.js')

/**
* Process all translations from app and modules.
* The i18n parts of the modules are already included in
* `app_i18n_plugins.js`. All this class does is to use
* the browserify included `require` to lookup the modules
* and include the translations to the main file.
*/
class I18nTranslations extends I18n {

    constructor(app, plugins) {
        super(app)
        this.translations.nl = require('./nl')
        console.log("PLUGINS")
        this.loadPluginsI18n(plugins)
    }
}

global.I18nTranslations = I18nTranslations
