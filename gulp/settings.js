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


module.exports = function config(projectDir, projectName, baseDir, {overrides = {}} = {}) {
    // Define all static or simple condition settings here.
    let settings = {
        BUILD_OPTIMIZED: argv.optimized ? true : (process.env.NODE_ENV === 'production'),
        BUILD_TARGET: argv.target ? argv.target : 'pwa',
        BUILD_TARGETS: ['pwa', 'node'],
        BUILD_VERBOSE: argv.verbose ? true : false,
        DEBUG_MODE: process.env.DEBUG === '1' ? true : false,
        // Default loglevel is info.
        LOG_LEVEL: (argv.L && argv.L.length <= 4) ? argv.L.length : 3,
        LOG_LEVELS: ['error', 'warning', 'info', 'debug'],
        NODE_ENVS: ['development', 'production'],
        // Safest default deploy target is `alpha`.
        PACKAGE_DIR: baseDir,
        PROJECT_DIR: projectDir,
        // Generate screenshots during browser tests?
        SIZE_OPTIONS: {showFiles: true, showTotal: true},
        SRC_DIR: path.join(baseDir, 'src'),
    }

    // Mix config file in settings and apply overrides.
    rc('ca11', settings)

    Object.assign(settings, overrides)

    settings.BUILD_DIR = path.join(baseDir, 'build')
    settings.PACKAGE = require(`${settings.PROJECT_DIR}/package`)


    settings.SCREENS_DIR = path.join(settings.BUILD_DIR, 'screens')
    settings.NODE_DIR = path.join(settings.PROJECT_DIR, 'node_modules') || process.env.NODE_DIR
    settings.TEMP_DIR = path.join(settings.BUILD_DIR, '.tmp')
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
                            {label: `PROJECT_DIR          ${tildify(settings.PROJECT_DIR)}`},
                            {label: `PACKAGE_DIR          ${tildify(settings.PACKAGE_DIR)}`},
                            {label: `SRC_DIR              ${tildify(settings.SRC_DIR)}`},
                            {label: `BUILD_DIR            ${tildify(settings.BUILD_DIR)}`},
                            {label: `TEMP_DIR             ${tildify(settings.TEMP_DIR)}`},
                            {label: `SCREENS_DIR          ${tildify(settings.SCREENS_DIR)}`},
                            {label: `THEME_DIR            ${tildify(settings.THEME_DIR)}`},
                        ],
                    },
                    {
                        label: c.cyan('Flags'),
                        nodes: [
                            {label: `BUILD_TARGET         --target ${format.selected(settings.BUILD_TARGETS, settings.BUILD_TARGET)}`},
                            {label: `BUILD_OPTIMIZED      --optimized <${settings.BUILD_OPTIMIZED ? c.bold.red('yes') : c.bold.red('no')}>`},
                            {label: `BUILD_VERBOSE        --verbose <${settings.BUILD_VERBOSE ? c.bold.red('yes') : c.bold.red('no')}`},
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
