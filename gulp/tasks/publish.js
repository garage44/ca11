const {promisify} = require('util')
const childExec = require('child_process').exec
const fs = require('fs')
const path = require('path')

const addsrc = require('gulp-add-src')
const archiver = require('archiver')
const createReleaseManager = require('gulp-sentry-release-manager')
const gulp = require('gulp')
const logger = require('gulplog')
const mkdirp = promisify(require('mkdirp'))

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
        if (settings.BUILD_TARGET === 'electron') distName += `-${settings.ELECTRON_ARCH}`
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
     * Deployment task for the Google webstore.
     * @returns {Promise} Resolves when zip package is generated.
     */
    tasks.package = function publishPackage() {
        return new Promise(async(resolve, reject) => {
            const distDir = path.join(settings.BASE_DIR, 'dist')
            await mkdirp(distDir)

            let distName = helpers.buildName()
            // Not using Gulp's Vinyl-based zip, because of a symlink issue that
            // prevents the MacOS build to be zipped properly.
            // See https://github.com/gulpjs/gulp/issues/1427 for more info.
            const output = fs.createWriteStream(path.join(distDir, distName))
            const archive = archiver('zip', {zlib: {level: 6}})
            archive.pipe(output)

            output.on('close', function() {
                logger.info(archive.pointer() + ' total bytes archived')
                resolve()
            })

            if (settings.BUILD_TARGET === 'electron') {
                const iconParam = `--icon=${settings.BUILD_DIR}/img/electron-icon.png`
                let buildParams = `--arch=${settings.ELECTRON_ARCH} --asar --overwrite --platform=${settings.ELECTRON_PLATFORM} --prune=true`
                // This is broken when used in combination with Wine due to rcedit.
                // See: https://github.com/electron-userland/electron-packager/issues/769
                if (settings.ELECTRON_PLATFORM !== 'win32') buildParams += iconParam
                const distBuildName = `${settings.ELECTRON_PLATFORM}-${settings.ELECTRON_ARCH}`
                const execCommand = `./node_modules/electron-packager/cli.js ${settings.BUILD_DIR} ca11 ${buildParams} --out=${distDir}`
                childExec(execCommand, undefined, (err, stdout, stderr) => {
                    if (stderr) logger.info(stderr)
                    if (stdout) logger.info(stdout)
                    setTimeout(() => {
                        archive.directory(path.join(distDir, distBuildName), distBuildName)
                        archive.finalize()
                    }, 500)
                })
            }
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
            }
        )(done)
    }


    tasks.sentryRemove = function publishSentryRemove(done) {
        const sentryManager = helpers.sentryManager()
        return gulp.series(sentryManager.remove)(done)
    }

    return {helpers, tasks}
}
