const {_extend} = require('util')
const fs = require('fs')
const path = require('path')

const addsrc = require('gulp-add-src')
const childExec = require('child_process').exec
const composer = require('gulp-uglify/composer')
const concat = require('gulp-concat')
const flatten = require('gulp-flatten')
const gulp = require('gulp')
const ifElse = require('gulp-if-else')
const insert = require('gulp-insert')
const imagemin = require('gulp-imagemin')
const logger = require('gulplog')
const minifier = composer(require('uglify-es'), console)
const notify = require('gulp-notify')
const size = require('gulp-size')
const svgo = require('gulp-svgo')
const template = require('gulp-template')
const vueCompiler = require('@garage11/vue-compiler-gulp')

let tasks = {}


module.exports = function(settings) {

    // Check if the theme directory exists.
    if (!fs.existsSync(settings.THEME_DIR)) {
        throw new Error(`Cannot find CA11 theme (${settings.THEME_DIR}`)
    }

    tasks.files = function assetsFiles() {
        const robotoPath = path.join(settings.NODE_DIR, 'roboto-fontface', 'fonts', 'roboto')
        return gulp.src(path.join(robotoPath, '{Roboto-Light.woff2,Roboto-Regular.woff2,Roboto-Medium.woff2}'))
            .pipe(flatten({newPath: './fonts'}))
            .pipe(addsrc(path.join(settings.BASE_DIR, 'img', '{*.png,*.jpg}'), {base: settings.BASE_DIR}))
            .pipe(addsrc(path.join(settings.THEME_DIR, 'fonts', '*.woff2'), {base: settings.THEME_DIR}))
            .pipe(addsrc(path.join(settings.THEME_DIR, 'img', '{*.icns,*.png,*.jpg}'), {base: settings.THEME_DIR}))
            .pipe(addsrc(path.join(settings.THEME_DIR, 'audio', '**', '*'), {base: settings.THEME_DIR}))
            .pipe(ifElse(settings.BUILD_OPTIMIZED, imagemin))
            .pipe(ifElse(settings.BUILD_TARGET === 'electron', () => {
                return addsrc(path.join(settings.PROJECT_DIR, 'package.json'))
            }))
            .pipe(addsrc(path.join(settings.PROJECT_DIR, 'LICENSE')))
            .pipe(addsrc(path.join(settings.PROJECT_DIR, 'README.md')))
            .pipe(addsrc(path.join(settings.BASE_DIR, '_locales', '**'), {base: './src/'}))
            .pipe(gulp.dest(path.join(settings.BUILD_DIR)))
            .pipe(size(_extend({title: 'assets'}, settings.SIZE_OPTIONS)))
    }


    tasks.html = function assetsHtml() {
        return gulp.src(path.join(settings.BASE_DIR, 'index.html'))
            .pipe(template({settings}))
            .pipe(flatten())
            .pipe(gulp.dest(settings.BUILD_DIR))
    }


    tasks.icons = function assetsIcons(done) {
        // Use relative paths or vsvg will choke.
        gulp.src(path.join(settings.BASE_DIR, 'svg', '*.svg'), {base: path.join(settings.BASE_DIR)})
            .pipe(addsrc(path.join(settings.THEME_DIR, 'svg', '*.svg'), {base: settings.THEME_DIR}))
            .pipe(svgo())
            .pipe(size(_extend({title: 'icons'}, settings.SIZE_OPTIONS)))
            .pipe(gulp.dest(path.join(settings.TEMP_DIR)))
            .on('end', () => {
                const iconSrc = path.join(settings.TEMP_DIR, 'svg')
                const iconBuildDir = path.join(settings.TEMP_DIR, 'build')
                const svgCommand = path.join(settings.NODE_DIR, 'vue-svgicon', 'dist', 'lib', 'index.js')
                const exec = `${svgCommand} -s ${iconSrc} -t ${iconBuildDir}`

                childExec(exec, undefined, (_err, stdout, stderr) => {
                    if (stderr) logger.warn(stderr)
                    if (stdout) logger.warn(stdout)
                    done()
                })
            })
    }


    tasks.templates = function assetsTemplates() {
        let sources = ['./components/**/*.vue']

        return gulp.src(sources)
            .pipe(vueCompiler({
                commonjs: false,
                namespace: 'global.templates',
                pathfilter: ['src', 'components', 'node_modules'],
            }))
            .on('error', notify.onError('Error: <%= error.message %>'))
            .pipe(ifElse(settings.BUILD_OPTIMIZED, () => minifier()))
            .pipe(concat('templates.js'))
            .pipe(insert.prepend('global.templates={};'))
            .pipe(gulp.dest(path.join(settings.BUILD_DIR, 'js')))
            .pipe(size(_extend({title: 'templates'}, settings.SIZE_OPTIONS)))
    }

    return {tasks}
}
