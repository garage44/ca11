const {promisify} = require('util')
const fs = require('fs')
const path = require('path')

const del = require('del')
const gulp = require('gulp')
const mkdirp = promisify(require('mkdirp'))
const livereload = require('gulp-livereload')

const PACKAGE = require('../../package')
const writeFileAsync = promisify(fs.writeFile)

let helpers = {}
let tasks = {}


module.exports = function(settings) {

    helpers.reload = function(filename) {
        return function reloadBrowser(done) {
            livereload.changed(filename)
            done()
        }
    }


    tasks.buildClean = function miscBuildClean(done) {
        del([path.join(settings.BUILD_DIR, '**')], {force: true}).then(() => {
            mkdirp(settings.BUILD_DIR).then(() => {done()})
        })
    }


    /**
    * Read the manifest file base and augment it
    * from the build configuration.
    */
    tasks.manifest = async function miscManifest() {
        let manifest = require(path.join(settings.BASE_DIR, 'manifest.json'))
        manifest.description = PACKAGE.description
        manifest.name = PACKAGE.productName
        manifest.short_name = PACKAGE.productName
        manifest.theme_color = settings.theme.colors['primary-color']

        await mkdirp(settings.BUILD_DIR)
        await writeFileAsync(
            path.join(settings.BUILD_DIR, 'manifest.json'),
            JSON.stringify(manifest, null, 4),
        )
    }


    /**
     * Watches files and execute tasks on changes.
     * Modules starting with `ca11-*` are watched when
     * they are on the same directory level.
     * This is due to a Chokidar issue that prevents
     * watching symlinked directories.
     */
    tasks.watch = function miscWatch() {
        const assets = require('./assets')(settings)
        const code = require('./code')(settings)
        const misc = require('./misc')(settings)
        const styles = require('./styles')(settings)
        const test = require('./test')(settings)

        if (settings.BUILD_TARGET === 'node') {
            // Node development doesn't have transpilation.
            // No other watchers are needed.
            gulp.watch([
                path.join(settings.BASE_DIR, 'js', '**', '*.js'),
            ], gulp.series(test.tasks.unit))
            return
        }

        if (settings.BUILD_TARGET === 'pwa') {
            gulp.watch([
                path.join(settings.BASE_DIR, 'js', 'sw.js'),
            ], gulp.series(code.tasks.serviceWorker))
        }

        if (settings.BUILD_TARGET === 'pwa') {
            gulp.watch([
                path.join(settings.BASE_DIR, 'manifest.json'),
            ], gulp.series(misc.tasks.manifest, helpers.reload('app.js')))
        }

        gulp.watch([
            path.join(settings.BASE_DIR, 'js', 'vendor.js'),
            path.join(settings.BASE_DIR, 'svg', '*.svg'),
        ], gulp.series(
            assets.tasks.icons,
            code.tasks.vendor,
            helpers.reload('vendor.js'),
        ))


        gulp.watch([
            path.join(settings.BASE_DIR, 'js', 'i18n', '*.js'),
        ], gulp.series(code.tasks.appI18n, helpers.reload('app_i18n.js')))


        gulp.watch([
            path.join(settings.BASE_DIR, 'index.html'),
        ], gulp.series(assets.tasks.html, helpers.reload('app.js')))

        gulp.watch([
            path.join(settings.BASE_DIR, 'components', '**', '*.js'),
            path.join(settings.BASE_DIR, 'js', 'index.js'),
            path.join(settings.BASE_DIR, 'js', 'lib', '**', '*.js'),
            path.join(settings.BASE_DIR, 'js', 'modules', '**', '*.js'),
            path.join(settings.PROJECT_DIR, '../', 'base', '**', '*.js'),
            path.join(settings.PROJECT_DIR, '../', 'sig11', '**', '*.js'),
        ], gulp.series(code.tasks.app, helpers.reload('app.js')))


        // gulp.watch([
        //     path.join(settings.PROJECT_DIR, '../', 'ca11-*', 'src', '**', '*.js'),
        // ], gulp.series(
        //     gulp.parallel(code.tasks.appI18n, code.tasks.app),
        //     code.tasks.plugins,
        //     helpers.reload('app_plugins.js'),
        // ))


        gulp.watch([
            path.join(settings.BASE_DIR, 'scss', '**', '*.scss'),
            path.join(settings.BASE_DIR, 'components', '**', '*.scss'),
            path.join(settings.PROJECT_DIR, '../', 'ca11-*', 'src', 'components', '**', '*.scss'),
        ], {followSymlinks: true}, gulp.series(styles.tasks.app, helpers.reload('app.css')))


        gulp.watch([
            path.join(settings.BASE_DIR, 'components', '**', '*.vue'),
            path.join(settings.PROJECT_DIR, '../', 'ca11-*', 'src', 'components', '**', '*.vue'),
        ], gulp.series(assets.tasks.templates, helpers.reload('templates.js')))


        gulp.watch([
            path.join(settings.BASE_DIR, 'tests', 'parts', '**', '*.js'),
        ], gulp.series(test.tasks.unit))
    }

    return {helpers, tasks}
}
