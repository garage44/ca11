const path = require('path')

const addsrc = require('gulp-add-src')
const createReleaseManager = require('gulp-sentry-release-manager')
const gulp = require('gulp')

const PACKAGE = require('../../package')

let helpers = {}
let tasks = {}


module.exports = function(settings) {
    /**
     * Generate a distribution name.
     * @returns {String} - The distribution name to use.
     */
    helpers.buildName = function() {
        let distName = `${settings.BUILD_TARGET}-${PACKAGE.version}`
        distName += '.zip'
        return distName
    }


    /**
     * Create a Sentry release manager with
     * the correct API settings.
     * @returns {SentryManager} The sentry manager to operate on.
     */
    helpers.sentryManager = function() {
        const sentry = settings.telemetry.sentry
        return createReleaseManager({
            apiKey: sentry.apiKey,
            host: sentry.host,
            org: sentry.org,
            project: sentry.project,
            sourceMapBasePath: '~/js/',
            version: settings.SENTRY_RELEASE,
        })
    }


    /**
    * Uploading a release and artificats to Sentry
    * requires at least Sentry 8.17.0.
    * See https://github.com/getsentry/sentry/issues/5459
    * @param {Function} done Gulp task callback.
    * @returns {Function} Gulp series task execution.
    */
    tasks.sentryRelease = function publishSentryRelease(done) {
        const sentryManager = helpers.sentryManager()
        return gulp.series(
            sentryManager.create,
            function sentryUpload() {
                const base = path.join(settings.BUILD_DIR, 'js')
                return gulp.src(path.join(base, '{*.js,*.map}'), {base})
                    .pipe(addsrc(path.join(settings.BASE_DIR, 'js', '**', '*.js'), {base: path.join('./')}))
                    .pipe(sentryManager.upload())
            },
        )(done)
    }


    tasks.sentryRemove = function publishSentryRemove(done) {
        const sentryManager = helpers.sentryManager()
        return gulp.series(sentryManager.remove)(done)
    }

    return {helpers, tasks}
}
