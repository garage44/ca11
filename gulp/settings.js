const path = require('path')
const argv = require('yargs').argv
const c = require('ansi-colors')
const rc = require('rc')
const tildify = require('tildify')


const format = {
    selected: (options, selected) => {
        let styledOptions = options.map((option) => {
            if (option === selected) return c.bold.green(option)
            else return c.grey(option)
        })
        return `${c.grey('[')}${styledOptions.join(c.grey('|'))}${c.grey(']')}`
    },
}


module.exports = function config(projectDir, baseDir, {overrides = {}} = {}) {
    // Define all static or simple condition settings here.
    let settings = {
        BASE_DIR: baseDir,
        BUILD_OPTIMIZED: argv.optimized ? true : (process.env.NODE_ENV === 'production'),
        BUILD_TARGET: argv.target ? argv.target : 'webview',
        BUILD_TARGETS: ['electron', 'pwa', 'node', 'webview'],
        BUILD_VERBOSE: argv.verbose ? true : false,
        DEBUG_MODE: process.env.DEBUG === '1' ? true : false,
        ELECTRON_ARCH: argv.arch ? argv.arch : 'x64',
        ELECTRON_ARCHES: ['all', 'ia32', 'x64', 'armv7l', 'arm64', 'mips64el'],
        ELECTRON_PLATFORM: argv.platform ? argv.platform : 'linux',
        ELECTRON_PLATFORMS: ['all', 'darwin', 'linux', 'mas', 'win32'],
        // Default loglevel is info.
        LOG_LEVEL: (argv.L && argv.L.length <= 4) ? argv.L.length : 3,
        LOG_LEVELS: ['error', 'warning', 'info', 'debug'],
        NO_SIG11: argv.nosig11 ? true : false,
        NODE_ENVS: ['development', 'production'],
        // Safest default deploy target is `alpha`.
        PROJECT_DIR: projectDir,
        PUBLISH_CHANNEL: argv.channel ? argv.channel : 'alpha',
        PUBLISH_CHANNELS: ['alpha', 'beta', 'production'],
        PUBLISH_TARGETS: ['pwa'],
        // Generate screenshots during browser tests?
        SIZE_OPTIONS: {showFiles: true, showTotal: true},

    }

    // Mix config file in settings and apply overrides.
    rc('ca11', settings)

    Object.assign(settings, overrides)

    settings.BUILD_ROOT_DIR = argv.buildroot ? argv.buildroot : path.join(settings.PROJECT_DIR, 'build')

    settings.PACKAGE = require(`${settings.PROJECT_DIR}/package`)

    Object.defineProperty(settings, 'BUILD_DIR', {
        get: function() {
            return path.join(settings.BUILD_ROOT_DIR, settings.BUILD_TARGET)
        },
    })

    // Override the release name when manually
    // removing a release and artifacts from Sentry.
    Object.defineProperty(settings, 'SENTRY_RELEASE', {
        get: function() {
            if (argv.release) return argv.release
            else return `${settings.PACKAGE.version}-${settings.PUBLISH_CHANNEL}-${settings.BUILD_TARGET}`
        },
    })

    settings.SCREENS_DIR = path.join(settings.BUILD_ROOT_DIR, 'docs', 'screens')
    settings.DIST_DIR = path.join(settings.PROJECT_DIR, 'dist')
    settings.NODE_DIR = path.join(settings.PROJECT_DIR, 'node_modules') || process.env.NODE_DIR
    settings.TEMP_DIR = path.join(settings.BUILD_ROOT_DIR, '.tmp')
    settings.THEME_DIR = path.join(settings.NODE_DIR, settings.theme, 'src')
    // The theme-config from ca11-theme.json
    settings.theme = require(path.join(settings.NODE_DIR, settings.theme, 'ca11-theme.json'))

    // Setup environment config.
    if (process.env.HEADLESS) settings.HEADLESS = process.env.HEADLESS === '1' ? true : false
    else settings.HEADLESS = settings.testing.headless
    settings.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'development'
    settings.SCREENS = process.env.SCREENS === '1' ? true : false

    // Validate some parameters.
    if (!settings.BUILD_TARGETS.includes(settings.BUILD_TARGET)) {
        // eslint-disable-next-line no-console
        console.log(`Invalid BUILD_TARGET: ${settings.BUILD_TARGET} ${format.selected(settings.BUILD_TARGETS)}`)
        process.exit(1)
    }
    if (!settings.PUBLISH_CHANNELS.includes(settings.PUBLISH_CHANNEL)) {
        // eslint-disable-next-line no-console
        console.log(`Invalid PUBLISH_CHANNEL: ${settings.PUBLISH_CHANNEL} ${format.selected(settings.PUBLISH_CHANNELS)}`)
        process.exit(1)
    }
    if (!settings.NODE_ENVS.includes(settings.NODE_ENV)) {
        // eslint-disable-next-line no-console
        console.log(`Invalid NODE_ENV: ${settings.NODE_ENV} ${format.selected(settings.NODE_ENVS)}`)
        process.exit(1)
    }

    // Build information overview.
    Object.defineProperty(settings, 'tree', {
        get: function() {
            return {
                label: 'Config',
                nodes: [
                    {
                        label: c.cyan('Directories'),
                        nodes: [
                            {label: `BASE_DIR             ${tildify(settings.BASE_DIR)}`},
                            {label: `BUILD_DIR            ${tildify(settings.BUILD_DIR)}`},
                            {label: `DIST_DIR             ${tildify(settings.DIST_DIR)}`},
                            {label: `PROJECT_DIR          ${tildify(settings.PROJECT_DIR)}`},
                            {label: `THEME_DIR            ${tildify(settings.THEME_DIR)}`},
                            {label: `SCREENS_DIR          ${tildify(settings.SCREENS_DIR)}`},
                            {label: `TEMP_DIR             ${tildify(settings.TEMP_DIR)}`},
                        ],
                    },
                    {
                        label: c.cyan('Flags'),
                        nodes: [
                            {label: `BUILD_ROOT_DIR       --buildroot <${c.bold.white(tildify(settings.BUILD_ROOT_DIR))}>`},
                            {label: `BUILD_TARGET         --target ${format.selected(settings.BUILD_TARGETS, settings.BUILD_TARGET)}`},
                            {label: `BUILD_OPTIMIZED      --optimized <${settings.BUILD_OPTIMIZED ? c.bold.red('yes') : c.bold.red('no')}>`},
                            {label: `BUILD_VERBOSE        --verbose <${settings.BUILD_VERBOSE ? c.bold.red('yes') : c.bold.red('no')}`},
                            {label: `PUBLISH_CHANNEL      --channel ${format.selected(settings.PUBLISH_CHANNELS, settings.PUBLISH_CHANNEL)}`},
                            {label: `ELECTRON_ARCH        --arch ${format.selected(settings.ELECTRON_ARCHES, settings.ELECTRON_ARCH)}`},
                            {label: `ELECTRON_PLATFORM    --platform ${format.selected(settings.ELECTRON_PLATFORMS, settings.ELECTRON_PLATFORM)}`},
                            {label: `SENTRY_RELEASE       --release <${c.bold.green(settings.SENTRY_RELEASE)}>`},
                            {label: `LOG_LEVEL            -${c.bold.green('L'.repeat(settings.LOG_LEVEL))} <${c.bold.red(settings.LOG_LEVELS[settings.LOG_LEVEL - 1])}>`},

                        ],
                    },
                    {
                        label: c.cyan('Environment'),
                        nodes: [
                            {label: `DEBUG_MODE           DEBUG=${settings.DEBUG_MODE ? c.bold.green('1') : c.bold.grey('0')}`},
                            {label: `HEADLESS             HEADLESS=${settings.HEADLESS ? c.bold.green('1') : c.bold.grey('0')}`},
                            {label: `NODE_ENV             NODE_ENV=${format.selected(settings.NODE_ENVS, settings.NODE_ENV)}`},
                            {label: `SCREENS              SCREENS=${settings.SCREENS ? c.bold.green('1') : c.bold.grey('0')}`},
                        ],
                    },
                ],
            }
        },
    })


    return settings
}
