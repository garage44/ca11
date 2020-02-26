import chalk from 'chalk'
import path from 'path'
import { performance } from 'perf_hooks'


class Task {

    constructor(title, execute) {
        this.title = title

        this.execute = execute
        this.prefix = {
            error: chalk.bold.red(`${this.title}`.padEnd(5, ' ')),
            ok: chalk.bold.green(`${this.title}`.padEnd(5, ' ')),
        }
    }

    log(...args) {
        // eslint-disable-next-line no-console
        console.log(...args)
    }

    async start(ep) {
        if (ep) {
            this.ep = {
                dirname: path.dirname(ep),
                extname: path.extname(ep),
                filename: path.basename(ep, path.extname(ep)),
                raw: ep,
            }
        }

        this.startTime = performance.now()
        this.log(`${this.prefix.ok} ${chalk.gray('task started')}`)
        try {
            const result = await this.execute()
            if (result && result.size) {
                if (result.size < 1024) {
                    this.size = `${result.size}b`
                } else {
                    if (result.size < 1048576) {
                        this.size = `${Number(result.size / 1024).toFixed(2)}kb`
                    } else {
                        this.size = `${Number(result.size / 1024 / 1024).toFixed(2)}mb`
                    }
                }
            }
        } catch (err) {
            this.log(`${this.prefix.error} task failed:\n${err}`)
        }

        this.endTime = performance.now()
        this.spendTime = `${Number(this.endTime - this.startTime).toFixed(1)}ms`
        let logComplete = `${this.prefix.ok} task completed (${chalk.bold(this.spendTime)}`
        if (this.size) logComplete += `, ${chalk.bold(this.size)}`
        logComplete += ')'

        this.log(logComplete)
    }
}



export default Task
