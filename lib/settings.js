import {__dirname} from './utils.js'
import path from 'path'
import rc from 'rc'
import themeSettings from '@ca11/webphone-theme'

const settings = rc('ca11', {host: '127.0.0.1', port: 35729})
settings.theme = themeSettings

const base = path.resolve(path.join(__dirname, '../'))
settings.dir = {
    base,
    build: path.join(base, 'build'),
    node: path.resolve(path.join(base, 'node_modules')),
    src: path.resolve(path.join(base, 'packages', 'webphone')),
    theme: path.resolve(path.join(base, 'packages', 'webphone-theme')),
    tmp: path.join(base, 'build', '.tmp'),
}

settings.build = {
    target: 'webphone',
    targets: ['docs', 'webphone'],
}

settings.dir.screens = path.resolve(path.join(settings.dir.build, 'screens'))

export default settings