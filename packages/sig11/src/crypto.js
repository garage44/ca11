
/**
 * Crypto for the SIG11 protocol. SIG11 depends on WebCrypto and
 * uses public key cryptography to negotiate AES session keys.
 * A user's identity is a RSA keypair. A session to another node
 * is established by creating a transient ECDH keypair, which is
 * signed by the RSA key, so we can verify its origin. This key
 * is used to establish the session's AES key.
 */
class Crypto {

    constructor(app) {
        this.app = app

        this.aes = {
            params: {length: 256, name: 'AES-GCM'},
        }

        this.rsa = {
            params: {
                hash: {name: 'SHA-256'},
                modulusLength: 2048,
                name: 'RSA-PSS',
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            },
            uses: ['sign', 'verify'],
        }

        this.ecdh = {
            params: {name: 'ECDH', namedCurve: 'P-256'},
            uses: ['deriveKey', 'deriveBits'],
        }
    }


    /**
    * Convert a base-64 encoded string to a DataArray.
    * @param {String} data - The base-64 formatted string.
    * @returns {ArrayBuffer} - A Buffer(Node) or Uint8Array(Browser).
    */
    __base64ToDataArray(data) {
        if (this.app.env.isBrowser) {
            let binaryString = atob(data)
            let len = binaryString.length
            let bytes = new Uint8Array(len)
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i)
            }
            return bytes.buffer
        }
        return new Buffer(data, 'base64')
    }


    /**
    * Get a binary datatype with a set size, based on the environment.
    * @param {Number} size - The size of the DataArray.
    * @returns {Uint8Array|Buffer} - A Uint8Array in the browser; a Buffer in Node.js.
    */
    __dataArray(size) {
        if (this.app.env.isBrowser) {
            return new Uint8Array(size)
        } else {
            return new Buffer(size)
        }
    }


    /**
    * Convert an ArrayBuffer to a base-64 encoded string.
    * @param {ArrayBuffer} data - The DataArray to convert.
    * @returns {String} - The base-64 encoded string of the DataArray.
    */
    __dataArrayToBase64(data) {
        let binary = ''
        let bytes = new Uint8Array(data)
        let len = bytes.byteLength
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i])
        }
        return btoa(binary)
    }


    /**
    * Convert an Uint8Array to a hexadecimal encoded string.
    * Useful to convert an ArrayBuffer hash to an id string.
    * @param {ArrayBuffer} dataArray - The DataArray to convert.
    * @returns {String} - A hexadecimal encoded string.
    */
    __dataArrayToHex(dataArray) {
        let byteArray = new Uint8Array(dataArray)
        let hexString = ''
        let nextHexByte

        for (let i = 0; i < byteArray.byteLength; i++) {
            nextHexByte = byteArray[i].toString(16)
            if (nextHexByte.length < 2) {
                nextHexByte = '0' + nextHexByte
            }
            hexString += nextHexByte
        }
        return hexString
    }


    /**
     * Convert an Uint8Array to a string.
     * @param {ArrayBuffer} dataArray - The DataArray to convert.
     * @returns {String} - The stringified DataArray.
     */
    __dataArrayToString(dataArray) {
        if (this.app.env.isBrowser) return new TextDecoder('utf-8').decode(dataArray)
        else return String.fromCharCode.apply(null, new Uint8Array(dataArray))
    }


    /**
    * Generate the user's identity, which is a RSA keypair. This keypair is
    * used to sign transient ECDH keys, in order to attain PFS.
    * See https://webkit.org/blog/7790/update-on-web-cryptography/
    * @returns {Object} - Serializable identity.
    */
    async createIdentity() {
        try {
            return await crypto.subtle.generateKey(
                this.rsa.params, true, this.rsa.uses,
            )
        } catch (err) {
            // eslint-disable-next-line no-console
            throw err
        }
    }


    /**
    * The vault AES key is generated from the user's password using
    * PBKDF2 and is cached in-memory. By default, it is also stored
    * in the unencrypted part of local storage, allowing the user to
    * auto-login. Logging out or disable auto-login only uses the
    * cached key. In this case, the user needs to refill it's password
    * as soon the plugin is restarted.
    * @param {String} username - Username to generate an AES key for.
    * @param {String} password - Password to generate an AES key for.
    * @returns {Promise} - Resolves with an AES-GCM key.
    */
    async createVaultKey(username, password) {
        let base64Salt = this.app.state.app.vault.salt
        let salt

        // The salt is bound to the username and is required.
        if (base64Salt) {
            salt = this.__base64ToDataArray(base64Salt)
        } else {
            salt = crypto.getRandomValues(new Uint8Array(16))
            base64Salt = this.__dataArrayToBase64(salt)
            this.app.setState({app: {vault: {salt: base64Salt}}}, {encrypt: false, persist: true})
        }

        let vaultKey = await crypto.subtle.importKey(
            'raw', this.stringToData(`${username}${password}`),
            {name: 'PBKDF2'}, false, ['deriveKey', 'deriveBits'],
        )

        // Use a decent iteration count to make the hashing mechanism slow
        // enough, to make it less likely that the password can be brute-forced.
        this.vaultKey = await crypto.subtle.deriveKey(
            {hash: {name: 'SHA-256'}, iterations: 500000, name: 'PBKDF2', salt},
            vaultKey, {length: 256, name: 'AES-GCM'}, true, ['encrypt', 'decrypt'])

        return this.vaultKey
    }


    /**
    * Decrypt a cypher object with an AES-GCM session key.
    * @param {CryptoKey} aesKey - The AES-GCM CryptoKey to decrypt a message with.
    * @param {Object} ciphertext - The cipher object.
    * @param {Object} [ciphertext.additionalData] - Additional authenticated data.
    * @param {Object} [ciphertext.cipher] - The actual encrypted payload.
    * @param {Object} [ciphertext.iv] - The initialization vector.
    * @returns {Promise} - Resolves with the decrypted plaintext message.
    */
    async decrypt(aesKey, ciphertext) {
        let decrypted = await crypto.subtle.decrypt({
            additionalData: this.__base64ToDataArray(ciphertext.additionalData),
            iv: this.__base64ToDataArray(ciphertext.iv),
            name: 'AES-GCM',
            tagLength: 128,
        }, aesKey, this.__base64ToDataArray(ciphertext.cipher))
        return this.__dataArrayToString(decrypted)
    }


    /**
    * Derive a common AES-GCM session key from a public key and the
    * user's private key.
    * @param {CryptoKey} publicKey - A public key to generate the session key for.
    * @returns {Promise} - Resolves with a AES-GCM CryptoKey that can be used for
    * encryption and decryption between endpoints.
    */
    async deriveAESFromECDH(publicKey) {
        this.app.logger.debug(`${this}deriving common aes-gcm key from ecdh secret`)
        const aesKey = await crypto.subtle.deriveKey({
            name: 'ECDH',
            namedCurve: 'P-256',
            public: publicKey,
        }, this.keypair.privateKey, {
            length: 256,
            name: 'AES-GCM',
        }, true, ['encrypt', 'decrypt'])
        return aesKey
    }


    /**
    * Encrypt a plaintext string with an AES-GCM session key.
    * @param {CryptoKey} aesKey - An AES-GCM key used to encrypt session data with.
    * @param {String} plaintext - The message data to encrypt.
    * @param {String} additionalData - Additional AES-GCM data that must be verifiable.
    * @returns {Promise} - Resolves with an AES cipher data object.
    */
    async encrypt(aesKey, plaintext, additionalData = null) {
        const iv = crypto.getRandomValues(this.__dataArray(16))
        if (additionalData) additionalData = this.stringToData(additionalData)
        else additionalData = this.__dataArray(0)
        const encrypted = await crypto.subtle.encrypt(
            {additionalData, iv, name: 'AES-GCM', tagLength: 128},
            aesKey, this.stringToData(plaintext))
        return {
            additionalData: this.__dataArrayToBase64(additionalData),
            cipher: this.__dataArrayToBase64(encrypted),
            iv: this.__dataArrayToBase64(iv),
        }
    }


    /**
    * Export an AES-GCM CryptoKey to a base-64 encoded string.
    * @param {CryptoKey} aesKey - An AES-GCM CryptoKey to convert.
    * @returns {Promise} - Resolves with a base-64 representation of an AES-GCM
    * CryptoKey.
    */
    async exportAES(aesKey) {
        // Export the AES key, so we can see if they look the same.
        const keydata = await crypto.subtle.exportKey('raw', aesKey)
        //returns the exported key data
        let base64Keydata = this.__dataArrayToBase64(keydata)
        this.app.logger.debug(`${this}exported AES-GCM session key`)
        return base64Keydata
    }


    /**
    * Generate a SHA-256 checksum hash from a string.
    * @param {String} data - The data to hash.
    * @returns {Promise} - Resolves with the SHA-256 hash of the supplied data.
    */
    async hash(data) {
        const ab = await crypto.subtle.digest({name: 'SHA-256'}, this.stringToData(data))
        return this.__dataArrayToHex(ab)
    }


    /**
    * Import an identity; a base64 stored keypair.
    * @params {Object} keypair - Public and Private key.
    * @returns {Object} - Serializable identity.
    */
    async importIdentity({publicKey, privateKey}) {
        if (!publicKey || !privateKey) throw new Error('invalid keypair')

        let [privateCryptoKey, publicCryptoKey] = await Promise.all([
            crypto.subtle.importKey('jwk', privateKey, this.rsa.params, true, ['sign']),
            crypto.subtle.importKey('jwk', publicKey, this.rsa.params, true, ['verify']),
        ])
        // The crypto.identity property holds both CryptoKeys.
        return {
            privateKey: privateCryptoKey,
            publicKey: publicCryptoKey,
        }
    }


    /**
    * Import a base64 AES vault key. This key is stored as base64
    * in localStorage when the user enabled it. The user is informed about
    * the security implications.
    * @param {String} vaultKey - Base64 encoded version of the Vault key (AES-GCM).
    */
    async importVaultKey(vaultKey) {
        try {
            this.vaultKey = await crypto.subtle.importKey(
                'raw', this.__base64ToDataArray(vaultKey), this.aes.params,
                true, ['encrypt', 'decrypt'])
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err)
        }
    }


    async serializeIdentity(keypair) {
        const publicKey = await crypto.subtle.exportKey('jwk', keypair.publicKey)
        const id = await this.hash(publicKey.n)
        return {
            headless: this.app.env.isNode,
            id,
            publicKey,
        }
    }


    async serializeKeypair(keypair) {
        let [privateKey, publicKey] = await Promise.all([
            crypto.subtle.exportKey('jwk', keypair.privateKey),
            crypto.subtle.exportKey('jwk', keypair.publicKey),
        ])

        const id = await this.hash(publicKey.n)
        return {id, privateKey, publicKey}
    }


    /**
    * Persist the encryption key to the unencrypted part
    * of the store, so the plugin can automatically unlock.
    * This is a tradeoff between usability and security.
    * @returns {String} - The base64-encoded vault key.
    */
    async storeVaultKey() {
        this.app.logger.debug(`${this}enable auto session recovery`)
        const vaultKey = await this.exportAES(this.vaultKey)
        this.app.setState({app: {vault: {key: vaultKey}}}, {encrypt: false, persist: true})
        return vaultKey
    }


    /**
    * Convert an ASCII string to an ArrayBuffer/Uint8Array.
    * @param {String} data - The string to convert.
    * @returns {ArrayBuffer|Uint8Array} - Return a Buffer in Node.js; an Uint8Array in the browser.
    */
    stringToData(data) {
        if (this.app.env.isBrowser) {
            let bytes = new Uint8Array(data.length)
            for (let iii = 0; iii < data.length; iii++) {
                bytes[iii] = data.charCodeAt(iii)
            }
            return bytes
        }

        return new Buffer(data)
    }


    /**
    * Generate a representational name for this module. Used for logging.
    * @returns {String} - An identifier for this module.
    */
    toString() {
        return `${this.app}[crypto] `
    }

    // async signPubKey(privateKey, publicKey) {
    //     const result = await crypto.subtle.exportKey('raw', keypair.publicKey)

    //     const signed = await crypto.subtle.sign(
    //         {name: this.rsa.params.name, saltLength: 16},
    //         keypair.privateKey,
    //         result,
    //     )

    // }
}

export default Crypto

