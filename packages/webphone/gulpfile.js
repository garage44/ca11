const path = require('path')

const gulp = require('gulp')

const settings = require('../../gulp/settings')(path.join(__dirname, '../../'), 'phone', __dirname)
const helpers = require('../../gulp/helpers')(settings)
const assets = require('../../gulp/tasks/assets')(settings)
const code = require('../../gulp/tasks/code')(settings)
const publish = require('../../gulp/tasks/publish')(settings)
const misc = require('../../gulp/tasks/misc')(settings)
const styles = require('../../gulp/tasks/styles')(settings)
const test = require('../../gulp/tasks/test')(settings)


const build = gulp.series(misc.tasks.buildClean, function build(done) {
    helpers.showBuildConfig()
    const tasks = ['assets', 'code', 'styles']
    if (settings.BUILD_TARGET === 'pwa') tasks.push(misc.tasks.manifest)
    return gulp.parallel(tasks)(done)
})


gulp.task('assets', gulp.parallel(assets.tasks.files, assets.tasks.html, assets.tasks.templates))
gulp.task('build', build)
gulp.task('clean', misc.tasks.buildClean)

gulp.task('code', (done) => {
    let runTasks = [
        code.tasks.app,
        code.tasks.appI18n,
        gulp.series(assets.tasks.icons, code.tasks.vendor),
    ]
    if (settings.BUILD_TARGET === 'electron') {
        runTasks.push(code.tasks.electron)
    } else if (settings.BUILD_TARGET === 'pwa') {
        runTasks.push(code.tasks.serviceWorker)
    }

    return gulp.parallel(runTasks)(done)
})

gulp.task('default', helpers.taskDefault)
gulp.task('develop', misc.tasks.watch)
gulp.task('manifest', misc.tasks.manifest)
gulp.task('package', gulp.series(build, publish.tasks.package))

gulp.task('sentry-release', publish.tasks.sentryRelease)
gulp.task('sentry-remove', publish.tasks.sentryRemove)
gulp.task('styles', (done) => {
    let runTasks = [styles.tasks.app]
    return gulp.parallel(runTasks)(done)
})


gulp.task('test-browser', function testBrowser(done) {
    const BUILD_TARGET = settings.BUILD_TARGET
    // Browser testing requires a webview build; the
    // previous build target is restored afterwards.
    settings.BUILD_TARGET = 'webview'

    return gulp.series(
        build,
        test.tasks.browser,
        async function restoreSettings() {
            settings.BUILD_TARGET = BUILD_TARGET
        },
    )(done)
})
gulp.task('test-lint', test.tasks.lint)
gulp.task('test-publish', gulp.series(
    test.tasks.lint,
    test.tasks.unit,
    'test-browser',
))

gulp.task('test-unit', test.tasks.unit)
// Add instructions to gulp tasks.
helpers.helpProject()
