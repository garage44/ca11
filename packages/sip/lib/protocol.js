class SipMessage {
    constructor(raw, direction) {
        this.direction = direction
        this.raw = raw

        this.header = {}
        this.parseHeader()
    }

    commaSepToObject(val) {
        const keypairs = val.split(',')
        const foo = {}
        for (const keypair of keypairs) {
            const [key, value] = keypair.split('=')
            foo[key] = value.replace(/"/g, '')
        }
        return foo
    }

    parseHeader() {
        this.lines = this.raw.trim().split('\r\n').filter(i => i !== '')
        if (!this.lines.length) {
            this.code = 'PING'
            return
        }

        if (this.direction === 'incoming') {
            const method = this.lines[0].split(' ')
            this.code = method[1]
            this.lines.shift()
        }

        for (const line of this.lines) {
            const key = line.split(':')[0]
            const value = line.replace(`${key}:`, '').trim()
            this.header[key] = value
        }

        if (this.header['WWW-Authenticate']) {
            this.digest = this.commaSepToObject(this.header['WWW-Authenticate'])
        }

    }
}

export default SipMessage