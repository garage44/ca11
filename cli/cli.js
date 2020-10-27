#!/usr/bin/env node
import _ from 'lodash'
import {buildInfo} from './utils.js'
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
import loadSettings from './settings.js'
import path from 'path'
import rollup from 'rollup'
import rollupCommonjs from '@rollup/plugin-commonjs'
import rollupReplace from '@rollup/plugin-replace'
import rollupResolve from '@rollup/plugin-node-resolve'
import rollupTerser from 'rollup-plugin-terser'
import sass from 'node-sass'
import svgIcon from 'vue-svgicon/dist/lib/build.js'
import Task from './task.js'
import tinylr from 'tiny-lr'
import VuePack from '@garage11/vuepack'
import yargs from 'yargs'


const cleanCSS = new CleanCSS({level: 2, returnPromise: true, sourceMap: true})
let settings
const tasks = {}
let vuePack

// Maps tasks to entrypoints.
const entrypoint = {
    html: 'index.html',
    js: 'js/app.js',
    scss: 'scss/ca11/app.scss',
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
        destination: path.join(settings.dir.build, 'img'),
        plugins: [
            imageminJpegtran(),
            imageminPngquant({
                quality: [0.6, 0.8],
            }),
        ],
    })

    await Promise.all([
        fs.copy(path.join(settings.dir.theme, 'audio'), path.join(settings.dir.build, 'audio')),
        fs.copy(path.join(settings.dir.theme, 'fonts'), path.join(settings.dir.build, 'fonts')),
    ])
})

tasks.build = new Task('build', async function() {
    await tasks.vue.start()
    await Promise.all([
        tasks.assets.start(),
        tasks.scss.start(entrypoint.scss),
        tasks.js.start(entrypoint.js),
        tasks.html.start(entrypoint.html),
    ])
})

tasks.html = new Task('html', async function() {
    const importMap = JSON.parse((await fs.readFile(path.join(settings.dir.build, 'lib', 'import-map.json'))))
    for (let [reference, location] of Object.entries(importMap.imports)) {
        importMap.imports[reference] = `/${path.join('lib', location)}`
    }

    const indexFile = await fs.readFile(path.join(settings.dir.webphone, 'index.html'))
    const compiled = _.template(indexFile)
    const html = compiled(Object.assign({settings}, {imports: importMap.imports}))

    await fs.writeFile(path.join(settings.dir.build, 'index.html'), html)
})

tasks.js = new Task('js', async function(file) {
    if (!settings.optimized) {
        // Snowpack only requires a light-weight copy action to the build dir.
        let targets
        if (file) {
            await fs.copy(file, path.join(settings.dir.build, file.replace(settings.dir.base, '')))
        } else {
            targets = (await globby([
                path.join(settings.dir.sip, '**', '*.js'),
                path.join(settings.dir.sig11, '**', '*.js'),
                path.join(settings.dir.webphone, '**', '*.js'),
                `!${path.join(settings.dir.webphone, 'test')}`,
            ]))

            targets.map((i) => {
                const relpath = i.replace(settings.dir.base, '')
                return fs.copy(i, path.join(settings.dir.build, relpath))
            })
            await Promise.all(targets)
        }

    } else {
        // Use rollup to generate an optimized bundle.
        const bundle = await rollup.rollup({
            input: path.join(settings.dir.webphone, this.ep.raw),
            plugins: [
                rollupResolve(), rollupCommonjs(), rollupTerser.terser(),
                rollupReplace({
                    'process.env.NODE_ENV': '"production"', // Needed for Vue esm build
                })],
        })

        const target = path.join(settings.dir.buildtarget, `${this.ep.filename}.js`)

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
        css: path.join(settings.dir.build, `${this.ep.filename}.css`),
        map: path.join(settings.dir.build, `${this.ep.filename}.css.map`),
    }

    return new Promise((resolve, reject) => {
        sass.render({
            file: path.join(settings.dir.webphone, this.ep.dirname, `${this.ep.filename}.scss`),
            importer: globImporter(),
            includePaths: [
                'node_modules',
                path.join(settings.dir.webphone, 'scss'),
                path.join(settings.dir.webphone, 'scss', 'ca11'),
            ],
            outFile: target.css,
            sourceMap: !settings.optimized,
            sourceMapContents: true,
            sourceMapEmbed: false,
        }, async function(err, sassObj) {
            if (err) reject(err.formatted)

            let cssRules
            const promises = []

            if (settings.optimized) {
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
    const vueFiles = await globby([path.join(settings.dir.webphone, 'components', '**', '*.vue')])
    if (!vuePack) {
        vuePack = new VuePack({
            basePath: settings.dir.base,
            excludeTokens: ['webphone', 'components'],
        })
    }

    const results = await vuePack.compile(vueFiles, this.ep ? this.ep.raw : null)
    const promises = []
    if (results.changed.components) {
        fs.writeFile(path.join(settings.dir.webphone, 'components.js'), results.components)
        promises.push(fs.writeFile(path.join(settings.dir.build, 'webphone',  'components.js'), results.components))
    }

    if (results.changed.templates) {
        // No need to wait for this write.
        fs.writeFile(path.join(settings.dir.webphone, 'templates.js'), results.templates)
        promises.push(fs.writeFile(path.join(settings.dir.build, 'webphone', 'templates.js'), results.templates))
    }
    await Promise.all(promises)
})

tasks.watch = new Task('watch', async function() {
    await tasks.build.start()
    return new Promise((resolve) => {
        var app = connect()
        app.use(tinylr.middleware({app}))
        app.listen({host: settings.dev.host, port: settings.dev.port}, () => {
            this.log(`development server listening: ${chalk.grey(`${settings.dev.host}:${settings.dev.port}`)}`)
            resolve()
        })

        chokidar.watch([
            path.join('!', settings.dir.webphone, 'js', 'components.js'),
            path.join('!', settings.dir.webphone, 'js', 'templates.js'), // Templates are handled by the Vue task
            path.join(settings.dir.webphone, '**', '*.js'),
            path.join(settings.dir.sig11, '**', '*.js'),
            path.join(settings.dir.sip, '**', '*.js'),
        ]).on('change', async(file) => {
            await tasks.js.start(entrypoint.js, file)
            tinylr.changed('app.js')
        })

        chokidar.watch(path.join(settings.dir.webphone, '**', '*.vue')).on('change', async(file) => {
            await tasks.vue.start(file)
            tinylr.changed('templates.js')
        })

        chokidar.watch(path.join(settings.dir.webphone, '**', '*.scss')).on('change', async() => {
            await tasks.scss.start(entrypoint.scss)
            tinylr.changed('app.css')
        })

        chokidar.watch(path.join(settings.dir.webphone, 'index.html')).on('change', async() => {
            await tasks.html.start(entrypoint.html)
            tinylr.changed('index.html')
        })
    })
})

;(async() => {
    settings = await loadSettings()
    const cli = {
        // eslint-disable-next-line no-console
        log(...args) {console.log(...args)},
        settings,
    }

    yargs
        .usage('Usage: $0 [task]')
        .detectLocale(false)
        .option('optimized', {alias: 'o', default: false, description: 'Optimized production mode', type: 'boolean'})
        .middleware(async(argv) => {
            if (!settings.version) {
                settings.version = JSON.parse((await fs.readFile(path.join(settings.dir.webphone, 'package.json')))).version
            }

            // Make sure the required build directories exist.
            await fs.mkdirp(path.join(settings.dir.buildtarget))
            settings.optimized = argv.optimized
            if (settings.optimized) {
                tasks.watch.log(`build optimization: ${chalk.green('enabled')}`)
            } else {
                tasks.watch.log(`build optimization: ${chalk.red('disabled')}`)
            }
        })

        .command('assets', 'collect and optimize assets', () => {}, () => {tasks.assets.start()})
        .command('build', `build ${settings.build.target} package`, () => {}, () => {tasks.build.start()})
        .command('config', 'list build config', () => {}, () => buildInfo(cli))
        .command('html', 'generate index.html', () => {}, () => {tasks.html.start(entrypoint.html)})
        .command('js', `prepare ${settings.build.target} JavaScript`, () => {}, () => {tasks.js.start(entrypoint.js)})
        .command('scss', 'compile stylesheets (SCSS)', () => {}, () => {tasks.scss.start(entrypoint.scss)})
        .command('vue', 'compile Vue templates (ESM)', () => {}, () => {tasks.vue.start()})
        .command('watch', `${settings.build.target} development modus`, () => {}, () => {tasks.watch.start()})
        .demandCommand()
        .help('help')
        .showHelpOnFail(true)
        .argv
})()



