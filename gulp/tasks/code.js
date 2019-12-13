const {_extend} = require('util')
const path = require('path')

const browserify = require('browserify')
const buffer = require('vinyl-buffer')
const composer = require('gulp-uglify/composer')
const envify = require('gulp-envify')

const gulp = require('gulp')
const ifElse = require('gulp-if-else')
const logger = require('gulplog')
const minifier = composer(require('terser'), console)
const notify = require('gulp-notify')
const size = require('gulp-size')
const source = require('vinyl-source-stream')
const sourcemaps = require('gulp-sourcemaps')
const watchify = require('watchify')

let bundlers = {}
let helpers = {}
let tasks = {}


module.exports = function(settings) {
    /**
     * Create a Browserify bundle.
     * @param {Object} options - Options to pass.
     * @param {Array} options.addons - Extra bundle entries.
     * @param {String} options.destination - Override the default destination.
     * @param {String} options.entry - Entrypoint file.
     * @param {String} options.name - Bundle name.
     * @param {Array} options.requires - Extra bundle requires.
     * @returns {Promise} - Resolves when bundling is finished.
     */
    helpers.compile = function({addons = [], destination = './js', entry, name, requires = []}) {

        if (!bundlers[name]) {
            let bundlerOptions = {
                basedir: settings.BASE_DIR,
                cache: {},
                debug: !settings.BUILD_OPTIMIZED,
                packageCache: {},
                paths: [
                    settings.NODE_DIR,
                    path.join(settings.PROJECT_DIR, '../'),
                ],
            }

            if (entry) bundlerOptions.entries = entry
            bundlers[name] = browserify(bundlerOptions)

            if (settings.LIVERELOAD) bundlers[name].plugin(watchify)

            for (let _addon of addons) bundlers[name].add(_addon)
            for (const _require of requires) bundlers[name].require(_require)

            bundlers[name].ignore('buffer')
            bundlers[name].ignore('process')
            bundlers[name].ignore('rc')
        }

        return new Promise((resolve) => {
            bundlers[name].bundle()
                .on('error', notify.onError('Error: <%= error.message %>'))
                .on('end', () => {resolve()})
                .pipe(source(`${name}.js`))
                .pipe(buffer())
                .pipe(sourcemaps.init({loadMaps: true}))
                .pipe(helpers.envify(settings))
                .pipe(ifElse(settings.BUILD_OPTIMIZED, () => minifier()))
                .pipe(sourcemaps.write('./'))
                .pipe(size(_extend({title: `${name}.js`}, settings.SIZE_OPTIONS)))
                .pipe(gulp.dest(path.join(settings.BUILD_DIR, destination)))
        })
    }


    helpers.envify = function() {
        return envify({
            APP_NAME: settings.name.production,
            BUILD_VERBOSE: settings.BUILD_VERBOSE,
            LANGUAGE: 'en-US',

            NODE_ENV: settings.NODE_ENV,
            SIG11_ENDPOINT: settings.endpoints.sig11,
            SIP_ENDPOINT: settings.endpoints.sip,
            STUN: settings.endpoints.stun,
            VERSION: settings.PACKAGE.version,
        })
    }


    helpers.plugins = async function(sectionModules) {
        let requires = []

        for (const moduleName of Object.keys(sectionModules)) {
            const sectionModule = sectionModules[moduleName]

            if (sectionModule.adapter) {
                logger.info(`adapter plugin ${moduleName} (${sectionModule.adapter})`)
                requires.push(`${sectionModule.adapter}/src/js`)
            } else if (sectionModule.providers) {
                for (const provider of sectionModule.providers) {
                    logger.info(`provider plugin ${moduleName} (${provider})`)
                    requires.push(`${provider}/src/js`)
                }
            }

            if (sectionModule.addons) {
                for (const addon of sectionModule.addons) {
                    logger.info(`addon plugin ${moduleName} (${addon})`)
                    requires.push(`${addon}/src/js`)
                }
            } else if (sectionModule.name) {
                logger.info(`custom plugin ${moduleName} (${sectionModule.name})`)
                requires.push(`${sectionModule.name}/src/js/`)
            }
        }

        await helpers.compile({name: 'app_plugins', requires})
    }


    tasks.app = async function codeApp(done) {
        await helpers.compile({entry: './js/index.js', name: 'app'})
        done()
    }


    tasks.appI18n = async function codeAppI18n(done) {
        await Promise.all([
            helpers.compile({entry: './js/i18n/index.js', name: 'app_i18n'}),
        ])
        done()
    }


    tasks.serviceWorker = async function codeServiceWorker(done) {
        await helpers.compile({destination: './', entry: './js/sw.js', name: 'sw'})
        done()
    }


    tasks.vendor = async function codeVendor(done) {
        await helpers.compile({
            // Add the compiled svg icon components to the vendor build.
            addons: [
                path.join(settings.TEMP_DIR, 'build', 'index.js'),
            ],
            entry: './js/vendor.js',
            name: 'vendor',
        })
        done()
    }

    return {helpers, tasks}
}
