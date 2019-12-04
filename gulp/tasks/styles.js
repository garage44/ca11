const {_extend} = require('util')
const path = require('path')

const cleanCSS = require('gulp-clean-css')
const concat = require('gulp-concat')
const gulp = require('gulp')
const ifElse = require('gulp-if-else')
const insert = require('gulp-insert')
const notify = require('gulp-notify')
const sass = require('gulp-sass')
const size = require('gulp-size')
const sourcemaps = require('gulp-sourcemaps')

let helpers = {}
let tasks = {}


module.exports = function(settings) {
    /**
    * Generic SCSS parsing helper for one or more entrypoints.
    * @param {Object} options Options to pass.
    * @param {Array} [options.addons] Add extra entrypoints.
    * @param {String} [options.entry] Name of the scss entrypoint.
    * @param {Boolean} options.debug] Generate sourcemaps.
    * @returns {Function} Gulp stream.
    */
    helpers.compile = function({addons = [], debug = false, entry}) {
        const themeColors = this.toScss(settings.theme.colors)
        let includePaths = [
            settings.NODE_DIR,
            // Use a directory up to the project directory,
            // because we want to expose ca11 as an import
            // prefix in project-related SCSS files.
            path.join(settings.BASE_DIR, 'scss'),
        ]
        const name = path.basename(entry, '.scss')

        let sources = [entry]
        if (addons.length) sources = sources.concat(addons)

        return gulp.src(sources)
            .pipe(insert.prepend(themeColors))
            .pipe(ifElse(debug, () => sourcemaps.init({loadMaps: true})))
            .pipe(sass({
                includePaths,
                sourceMap: false,
                sourceMapContents: false,
            }))
            .on('error', notify.onError('Error: <%= error.message %>'))
            .pipe(concat(`${name}.css`))
            .pipe(ifElse(settings.BUILD_OPTIMIZED, () => cleanCSS({advanced: true, level: 2})))
            .pipe(ifElse(debug, () => sourcemaps.write('./')))
            .pipe(gulp.dest(path.join(settings.BUILD_DIR, 'css')))
            .pipe(size(_extend({title: `scss-${name}`}, settings.SIZE_OPTIONS)))
    }


    /**
    * Convert key/value object to SCSS variables string.
    * @param {Object} properties Object with depth 1.
    * @returns {String} Scss-formatted variables string.
    */
    helpers.toScss = function(properties) {
        return Object.keys(properties).map((name) => '$' + name + ': ' + properties[name] + ';').join('\n')
    }


    tasks.app = function stylesApp() {
        return helpers.compile({
            addons: [path.join(settings.BASE_DIR, 'components', '**', '*.scss')],
            debug: !settings.BUILD_OPTIMIZED,
            entry: './scss/ca11/app.scss',
        })
    }

    return {helpers, tasks}
}
