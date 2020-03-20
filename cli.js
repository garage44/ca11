#!/usr/bin/env node
import _ from 'lodash'
import {__dirname} from './lib/utils.js'
import chalk from 'chalk'
import chokidar from 'chokidar'
import CleanCSS from 'clean-css'
import connect from 'connect'
import fs from 'fs-extra'
import globby from 'globby'
import globImporter from 'node-sass-glob-importer'
import imagemin from 'imagemin'
import imageminJpegtran from 'imagemin-jpegtran'
import imageminPngquant from 'imagemin-pngquant'
import mount from 'connect-mount'
import path from 'path'
import rc from 'rc'
import rollup from 'rollup'
import rollupCommonjs from '@rollup/plugin-commonjs'
import rollupReplace from '@rollup/plugin-replace'
import rollupResolve from '@rollup/plugin-node-resolve'
import rollupTerser from 'rollup-plugin-terser'
import sass from 'node-sass'
import serveStatic from 'serve-static'
import svgIcon from 'vue-svgicon/dist/lib/build.js'
import Task from './lib/task.js'
import themeSettings from '@ca11/webphone-theme'
import tinylr from 'tiny-lr'
import VuePack from '@garage11/vuepack'
import yargs from 'yargs'


let settings = rc('ca11', {host: '127.0.0.1', port: 35729})
settings.theme = themeSettings

settings.buildTarget

settings.dir = {base: path.resolve(path.join(__dirname, '../'))}

Object.assign(settings.dir, {
    build: path.join(settings.dir.base, 'build'),
    node: path.resolve(path.join(settings.dir.base, 'node_modules')),
    src: path.resolve(path.join(settings.dir.base, 'packages', 'webphone')),
    theme: path.resolve(path.join(settings.dir.base, 'packages', 'webphone-theme')),
    tmp: path.join(settings.dir.base, 'build', '.tmp'),
})

const tasks = {}

const cleanCSS = new CleanCSS({level: 2, returnPromise: true, sourceMap: true})
const vuePack = new VuePack({pathfilter: ['packages', 'webphone', 'src', 'components']})

// Maps tasks to entrypoints.
const entrypoint = {
    html: 'index.html',
    js: 'js/app.js',
    scss: 'scss/ca11/app.scss',
    vue: 'components/**/*.vue',
}

tasks.assets = new Task('assets', async function() {
    svgIcon.default({
        es6: true,
        ext: 'js',
        idSP: '_',
        sourcePath: path.join(settings.dir.theme, 'svg'),
        targetPath: path.join(settings.dir.theme, 'icons'),
        tpl: '',
    })

    await imagemin([path.join(settings.dir.theme, 'img', '*.{jpg,png}')], {
        destination: path.join(settings.dir.build, 'static', 'img'),
        plugins: [
            imageminJpegtran(),
            imageminPngquant({
                quality: [0.6, 0.8],
            }),
        ],
    })

    await Promise.all([
        fs.copy(path.join(settings.dir.theme, 'audio'), path.join(settings.dir.build, 'static', 'audio')),
        fs.copy(path.join(settings.dir.theme, 'fonts'), path.join(settings.dir.build, 'static', 'fonts')),
    ])
})

tasks.build = new Task('build', async function() {
    await tasks.vue.start(entrypoint.vue)
    await Promise.all([
        tasks.scss.start(entrypoint.scss),
        tasks.js.start(entrypoint.js),
        tasks.html.start(entrypoint.html),
    ])
})

tasks.html = new Task('html', async function() {
    const indexFile = await fs.readFile(path.join(settings.dir.src, 'index.html'))
    const compiled = _.template(indexFile)
    const html = compiled({settings})

    await fs.writeFile(path.join(settings.dir.build, 'index.html'), html)
})

tasks.js = new Task('js', async function() {
    if (!settings.production) {
        // Snowpack only requires a light-weight copy action to the build dir.
        let targets = (await globby([path.join(settings.dir.src, '**', '*.js')]))
            .map((i) => fs.copy(i, path.join(settings.dir.build, 'static', i.replace(settings.dir.src, ''))))

        await Promise.all(targets)
    } else {
        // Use rollup to generate an optimized bundle.
        const bundle = await rollup.rollup({
            input: path.join(settings.dir.src, this.ep.raw),
            plugins: [
                rollupResolve(), rollupCommonjs(), rollupTerser.terser(),
                rollupReplace({
                    'process.env.NODE_ENV': '"production"', // Needed for Vue esm build
                })],
        })

        const target = path.join(settings.dir.build, 'static', `${this.ep.filename}.js`)

        await bundle.write({
            file: target,
            format: 'iife',
            name: 'app',
            sourcemap: true,
        })


        return ({size: (await fs.readFile(target)).length})
    }
})

tasks.scss = new Task('scss', async function() {
    let target = {
        css: path.join(settings.dir.build, 'static', `${this.ep.filename}.css`),
        map: path.join(settings.dir.build, 'static', `${this.ep.filename}.css.map`),
    }

    return new Promise((resolve, reject) => {
        sass.render({
            file: path.join(settings.dir.src, this.ep.dirname, `${this.ep.filename}.scss`),
            importer: globImporter(),
            includePaths: [
                'node_modules',
                path.join(settings.dir.src, 'scss'),
                path.join(settings.dir.src, 'scss', 'ca11'),
            ],
            outFile: target.css,
            sourceMap: !settings.production,
            sourceMapContents: true,
            sourceMapEmbed: false,
        }, async function(err, sassObj) {
            if (err) reject(err.formatted)

            let cssRules
            const promises = []

            if (settings.production) {
                cssRules = (await cleanCSS.minify(sassObj.css)).styles
            } else {
                cssRules = sassObj.css
                promises.push(fs.writeFile(target.map, sassObj.map))
            }

            promises.push(fs.writeFile(target.css, cssRules))
            await Promise.all(promises)

            resolve({size: cssRules.length})
        })
    })
})

tasks.vue = new Task('vue', async function() {
    const targets = await globby([path.join('packages', 'webphone', this.ep.raw)])
    const templates = await vuePack.compile(targets)
    // This is an exceptional build target, because it is not
    // a module that is available from Node otherwise.
    await Promise.all([
        fs.writeFile(path.join(settings.dir.src, 'templates.js'), templates),
        fs.writeFile(path.join(settings.dir.build, 'static', 'templates.js'), templates),
    ])
})

tasks.watch = new Task('watch', async function() {
    await tasks.build.start()
    return new Promise((resolve, reject) => {
        var app = connect()
        app.use(mount('/static', serveStatic(path.join(settings.dir.build, 'static'))))
            .use(async(req, res, next) => {
                if (req.url.includes('livereload.js')) {
                    next()
                } else {
                    const html = await fs.readFile(path.join(settings.dir.build, 'index.html'))
                    res.setHeader('Content-Type', 'text/html; charset=UTF-8')
                    res.end(html)
                }

            })
            .use(tinylr.middleware({app}))

            .listen({host: settings.host, port: settings.port}, () => {
                this.log(`development server listening: ${chalk.grey(`${settings.host}:${settings.port}`)}`)
                resolve()
            })

        chokidar.watch([
            path.join('!', settings.dir.src, 'js', 'templates.js'), // Templates are handled by the Vue task
            path.join(settings.dir.src, '**', '*.js'),
        ]).on('change', async() => {
            await tasks.js.start(entrypoint.js)
            tinylr.changed('app.js')
        })

        chokidar.watch(path.join(settings.dir.src, '**', '*.vue')).on('change', async() => {
            await tasks.vue.start(entrypoint.vue)
            tinylr.changed('templates.js')
        })

        chokidar.watch(path.join(settings.dir.src, '**', '*.scss')).on('change', async() => {
            await tasks.scss.start(entrypoint.scss)
            tinylr.changed('app.css')
        })

        chokidar.watch(path.join(settings.dir.src, 'index.html')).on('change', async() => {
            await tasks.html.start(entrypoint.html)
            tinylr.changed('index.html')
        })
    })
})

yargs
    .usage('Usage: $0 [task]')
    .detectLocale(false)
    .showHelpOnFail(true)
    .help('help')
    .option('production', {alias: 'p', default: false, description: 'Production mode', type: 'boolean'})
    .middleware(async(argv) => {
        // Make sure the required build directories exist.
        await fs.mkdirp(path.join(settings.dir.build, 'static', 'js'))
        settings.production = argv.production
        if (settings.production) {
            tasks.watch.log(`build optimization: ${chalk.green('enabled')}`)
        } else {
            tasks.watch.log(`build optimization: ${chalk.red('disabled')}`)
        }
    })
    .command('assets', 'prepare theme files', () => {}, () => {
        tasks.assets.start()
    })
    .command('build', 'generate project files', () => {}, () => {
        tasks.build.start()
    })
    .command('html', 'generate index.html', () => {}, () => {
        tasks.html.start(entrypoint.html)
    })
    .command('js', 'prepare JavaScript for the browser', () => {}, () => {
        tasks.js.start(entrypoint.js)
    })
    .command('scss', 'compile SCSS styles to CSS', () => {}, () => {
        tasks.scss.start(entrypoint.scss)
    })
    .command('vue', 'compile Vue templates to ESM', () => {}, () => {
        tasks.vue.start(entrypoint.vue)
    })
    .command('watch', 'start development server', () => {}, () => {
        tasks.watch.start()
    })
    .demandCommand()
    .argv
