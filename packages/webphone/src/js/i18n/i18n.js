import I18n from '../lib/i18n.js'
import {nl} from './nl.js'

/**
* Process all translations from Ca11 and its modules.
* The i18n parts of the modules are already included in
* `app_i18n_plugins.js`. All this class does is to use
* the browserify included `require` to lookup the modules
* and include the translations to the main file.
*/
class I18nTranslations extends I18n {

    constructor(app, plugins) {
        super(app)
        this.translations.nl = nl
    }
}

export default I18nTranslations
