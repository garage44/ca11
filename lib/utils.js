import archy from 'archy'
import chalk from 'chalk'
import path from 'path'
import tildify from 'tildify'

export const __dirname = path.dirname(new URL(import.meta.url).pathname)

const format = {
    selected: (options, selected) => {
        let styledOptions = options.map((option) => {
            if (option === selected) return chalk.blue(option)
            else return chalk.grey(option)
        })
        return `${chalk.grey('[')}${styledOptions.join(chalk.grey('|'))}${chalk.grey(']')}`
    },
}


export const buildInfo = function(cli) {
    const tree = {
        label: 'Config:',
        nodes: [
            {
                label: chalk.bold.blue('Directories'),
                nodes: Object.entries(cli.settings.dir).map(([k, dir]) => {
                    return {label: `${k.padEnd(10, ' ')} ${tildify(dir)}`}
                })
            },
            {
                label: chalk.bold.blue('Flags'),
                nodes: [
                    {label: `${'target'.padEnd(10, ' ')} --target ${format.selected(cli.settings.build.targets, cli.settings.build.target)}`}
                ]
            }
        ]
    }
    cli.log('\r')
    archy(tree).split('\r').forEach((line) => cli.log(line))
}

