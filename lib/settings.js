import {__dirname} from './utils.js'
import fs from 'fs-extra'
import path from 'path'
import rc from 'rc'
import themeSettings from '@ca11/theme'


export default async () => {
    const base = path.resolve(path.join(__dirname, '../'))
    const webphoneDir = path.resolve(path.join(base, 'webphone'))

    const defaults = JSON.parse(await fs.readFile(path.join(webphoneDir, '.webphonerc.defaults'), 'utf8'))
    const settings = {
        build: {
            // Reserves space for multiple build projects.
            target: 'webphone',
            targets: ['webphone'],
        },
        dev: {host: '127.0.0.1', port: 35729},
        dir: {
            base,
            build: path.join(base, 'build'),
            node: path.resolve(path.join(base, 'node_modules')),
            sip: path.resolve(path.join(base, 'sip')),
            sig11: path.resolve(path.join(base, 'sig11')),
            theme: path.resolve(path.join(base, 'theme')),
            tmp: path.join(base, 'build', '.tmp'),
            webphone: webphoneDir,
        },
        webphone: rc('webphone', defaults)
    }
    settings.dir.screens = path.resolve(path.join(settings.dir.build, 'screens'))
    settings.webphone.theme = themeSettings

    return settings
}