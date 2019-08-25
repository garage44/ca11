const {promisify} = require('util')
const fs = require('fs').promises
const path = require('path')
const gulp = require('gulp')

const logger = require('gulplog')
const mkdirp = promisify(require('mkdirp'))
const {spawn} = require('child_process')

const settings = require('../gulp/settings')(__dirname, {
    overrides: {
        BUILD_TARGET: 'docs',
        BUILD_TARGETS: ['docs'],
    },
})
const helpers = require('../gulp/helpers')(settings)

// Load Gulp task modules.
const assets = require('../gulp/tasks/assets')(settings)
const code = require('../gulp/tasks/code')(settings)
const misc = require('../gulp/tasks/misc')(settings)
const styles = require('../gulp/tasks/styles')(settings)

const tasks = {}


tasks.codeApp = async function codeApp() {
    await code.helpers.compile({entry: './src/js/index.js', name: 'app'})
}


tasks.codeVendor = async function codeVendor() {
    await code.helpers.compile({
        addons: [
            path.join(settings.TEMP_DIR, settings.BRAND_TARGET, 'build', 'index.js'),
        ],
        entry: './src/js/vendor.js',
        name: 'vendor',
    })
}

tasks.html = assets.tasks.html
tasks.files = assets.tasks.files


tasks.screens = function screens(done) {
    logger.info('Generating screenshots; use gulp -LLLL to show process output')
    const childProcess = spawn('gulp test-browser', {
        cwd: settings.ROOT_DIR,
        env: Object.assign({
            BRAND: settings.BRAND_TARGET,
            LOGGER: 'stdout',
            SCREENS: '1',
        }, process.env),
        shell: true,
    })

    childProcess.stderr.on('data', (data) => process.stderr.write(`${data}`))
    childProcess.on('close', () => done())
    childProcess.stdout.on('data', (data) => {
        if (settings.LOG_LEVEL === 4) process.stdout.write(`${data}`)
    })
}


tasks.pages = async function pages(done) {
    const description = JSON.parse((await fs.readFile('src/topics/topics.json')))
    const developerFiles = await Promise.all(description.topics.developer.map((i) => fs.readFile(`src/topics/developer/${i.name}.vue`)))
    const userFiles = await Promise.all(description.topics.user.map((i) => fs.readFile(`src/topics/user/${i.name}.vue`)))

    let data = {
        topics: {
            developer: [],
            user: [],
        },
    }

    for (const [i, file] of developerFiles.entries()) {
        let topic = description.topics.developer
        // Internal documents are used for company documentation.
        if (topic[i].internal) continue

        data.topics.developer.push({
            content: file.toString('utf8'),
            icon: topic[i].icon,
            name: topic[i].name,
            title: topic[i].title,
        })
    }

    for (const [i, file] of userFiles.entries()) {
        let topic = description.topics.user
        data.topics.user.push({
            content: file.toString('utf8'),
            icon: topic[i].icon,
            name: topic[i].name,
            title: topic[i].title,
        })
    }

    await mkdirp(path.join(settings.BUILD_DIR, 'js'))
    fs.writeFile(path.join(settings.BUILD_DIR, 'js', 'pages.js'), `window.pages = ${JSON.stringify(data)}`)
}


tasks.styles = function() {
    const addons = [
        path.join(settings.SRC_DIR, 'components', '**', '*.scss'),
        path.join(settings.NODE_DIR, 'highlight.js', 'styles', 'atom-one-dark.css'),
    ]
    return styles.helpers.compile({
        addons,
        debug: !settings.BUILD_OPTIMIZED,
        entry: path.join(settings.SRC_DIR, 'scss', 'app.scss'),
    })
}


tasks.templates = function templates() {
    return assets.tasks.templates('./src/components/**/*.vue')
}


tasks.watch = function watchProject() {
    misc.helpers.serveHttp()

    gulp.watch([
        path.join(settings.SRC_DIR, 'index.html'),
    ], gulp.series(tasks.html, misc.helpers.reload('app.js')))


    gulp.watch([
        path.join(settings.SRC_DIR, 'components', '**', '*.scss'),
        path.join(settings.SRC_DIR, 'scss', '**', '*.scss'),
    ], gulp.series(tasks.styles, misc.helpers.reload('app.css')))

    gulp.watch([
        // Watch for changes from App code.
        path.join(settings.ROOT_DIR, 'src', 'js', '**', '*.js'),
        path.join(settings.SRC_DIR, 'components', '**', '*.js'),
        path.join(settings.SRC_DIR, 'js', '**', '*.js'),
        `!${path.join(settings.SRC_DIR, 'js', 'vendor.js')}`,
    ], gulp.series(tasks.codeApp, misc.helpers.reload('app.js')))

    gulp.watch([
        path.join(settings.SRC_DIR, 'js', 'vendor.js'),
    ], gulp.series(
        assets.tasks.icons,
        tasks.codeVendor,
        misc.helpers.reload('vendor.js'),
    ))

    gulp.watch([
        path.join(settings.SRC_DIR, 'topics', 'topics.json'),
        path.join(settings.SRC_DIR, 'topics', '**', '*.vue'),
    ], gulp.series('pages', misc.helpers.reload('topics.json')))


    gulp.watch([
        path.join(settings.SRC_DIR, 'components', '**', '*.vue'),
    ], gulp.series(tasks.templates, misc.helpers.reload('app.js')))
}


gulp.task('assets', gulp.parallel(
    tasks.html,
    tasks.files,
    tasks.templates,
))

gulp.task('code', gulp.parallel(
    tasks.codeApp,
    gulp.series(assets.tasks.icons, tasks.codeVendor),
))

gulp.task('pages', tasks.pages)
gulp.task('screens', tasks.screens)
gulp.task('styles', tasks.styles)


const build = gulp.series(misc.tasks.buildClean, function build(done) {
    helpers.showBuildConfig()
    return gulp.parallel(
        'assets',
        'code',
        'styles',
        'pages',
        'screens',
    )(done)
})
gulp.task('build', build)

gulp.task('default', helpers.taskDefault)
gulp.task('develop', gulp.series('build', tasks.watch))
// Add instructions to gulp tasks.
helpers.helpDocs(settings)
