const path = require('path')

const eslint = require('gulp-eslint')
const filter = require('gulp-filter')
const gulp = require('gulp')
const stylelint = require('gulp-stylelint')
const tape = require('gulp-tape')
const tapSpec = require('tap-spec')
const through = require('through2')

let helpers = {}
let tasks = {}


module.exports = function(settings) {
    /**
     * Run several functional tests using Puppeteer.
     * @param {Function} done Gulp task callback.
     * @returns {Stream} A Gulp stream.
     */
    tasks.browser = function testBrowser(done) {
        const reporter = through.obj()
        reporter.pipe(tapSpec()).pipe(process.stdout)
        return gulp.src('tests/browser/*.js')
            .pipe(tape({bail: true, outputStream: reporter}))
            .on('error', () => {process.exit(1)})
            .on('end', async() => {
                done()
            })
    }


    /**
     * Lints for code consistency using .eslintrc,
     * styling consistency using .stylelintrc and
     * protects against leaking secrets.
     * @param {Function} done Gulp task callback.
     * @returns {Stream} A Gulp stream.
     */
    tasks.lint = function testLint(done) {
        const jsFilter = filter('**/*.js', {restore: true})
        const scssFilter = filter('**/*.scss', {restore: true})

        return gulp.src([
            'gulpfile.js',
            'src/**/*.js',
            'tests/**/*.js',
            'tools/**/*.js',
            path.join(settings.SRC_DIR, '**', '*.scss'),
            '.ca11rc*',
        ])
            .pipe(jsFilter)
            .pipe(eslint())
            .pipe(eslint.format())
            .pipe(eslint.failAfterError())
            .pipe(jsFilter.restore)

            .pipe(scssFilter)
            .pipe(stylelint({
                reporters: [{
                    console: true,
                    formatter: 'string',
                }],
            }))
            .pipe(scssFilter.restore)
    }


    tasks.unit = function testUnit() {
        const reporter = through.obj()
        reporter.pipe(tapSpec()).pipe(process.stdout)

        return gulp.src('tests/parts/**/*.js')
            .pipe(tape({bail: true, outputStream: reporter}))
    }

    return {helpers, tasks}
}
