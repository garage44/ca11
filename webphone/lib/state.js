import { getKeyPath, mergeDeep, setKeyPath } from '/webphone/lib/utils.js'


const mergeActiveState = (app, {action = 'upsert', path = null, source = null, state}) => {
    let stateSource
    if (source) stateSource = source
    else stateSource = app.state

    if (!path) {
        mergeDeep(stateSource, state)
        return
    }

    path = path.split('.')
    if (action === 'upsert') {
        let _ref = getKeyPath(stateSource, path)
        // Needs to be created first.
        if (typeof _ref === 'undefined') {
            setKeyPath(app.vm, stateSource, path, state)
        } else {
            _ref = path.reduce((o, i)=>o[i], stateSource)
            mergeDeep(_ref, state)
        }
    } else if (action === 'delete') {
        const _ref = path.slice(0, path.length - 1).reduce((o, i)=>o[i], stateSource)
        app.vm.$delete(_ref, path[path.length - 1])
    } else if (action === 'replace') {
        const _ref = path.slice(0, path.length - 1).reduce((o, i)=>o[i], stateSource)
        app.vm.$set(_ref, path[path.length - 1], state)
    } else {
        throw new Error(`invalid path action for _mergeState: ${action}`)
    }
}


/**
* This operation applies the state update and processes unencrypted
* writes immediately; these can be done synchronously. Encrypted store
* writes are deferred to a write queue.
* @param {Object} app - The application object.
* @param {Object} options - See the parameter description of super.
* @returns {null|Promise} - Encrypt operation returns a Promise.
*/
export const mergeState = (app, {action = 'upsert', encrypt = true, path = null, persist = false, state}) => {
    const storeEndpoint = app.state.app.session.active
    // This could happen when an action is still queued, while the user
    // is logging out at the same moment. The action is then ignored.
    if (persist && !storeEndpoint) return null

    // Apply the state change to the active store.
    mergeActiveState(app, {action, encrypt, path, persist, state})
    if (!persist) return null

    // Apply the changes to the cached store.
    let storeState
    if (!encrypt) storeState = app.stateStore.cache.unencrypted
    else storeState = app.stateStore.cache.encrypted

    mergeActiveState(app, {action, encrypt, path, persist, source: storeState, state})

    // Write synchronously unencrypted data to LocalStorage.
    if (!encrypt) {
        app.stateStore.set(`${storeEndpoint}/state`, storeState)
        return null
    }

    // Data is first encrypted async; then written to LocalStorage.
    // First make a snapshot and sent the write action to the queue.
    // All async write actions must be processed in order.
    return new Promise((resolve) => {
        app.stateStore.processQueue({
            action: (item) => app.stateStore.writeEncrypted({item, resolve}),
            status: 0,
        })
    })
}


export const restoreState = async(app) => {
    const sessionId = app.state.app.session.active

    let unencryptedState = app.stateStore.get(`${sessionId}/state`)
    if (!unencryptedState) {
        throw new Error(`state store for session not found: '${sessionId}'`)
    }

    app.stateStore.cache.unencrypted = unencryptedState

    // Determine if there is an encrypted state vault.
    let cipherData = app.stateStore.get(`${sessionId}/state/vault`)
    let decryptedState = {}
    if (cipherData) {
        try {
            decryptedState = JSON.parse(await app.crypto.decrypt(app.crypto.vaultKey, cipherData))
        } catch (err) {
            app.logger.debug(`failed to restore encrypted state`)
            throw new Error('failed to decrypt; wrong password?')
        }

        app.logger.debug(`session vault decrypted`)
    } else decryptedState = {}
    app.stateStore.cache.encrypted = decryptedState

    let state = {}
    mergeDeep(state, decryptedState, unencryptedState)

    for (let module of Object.keys(app.modules)) {
        if (app.modules[module].state) {
            const moduleState = app.modules[module].state()
            // Nothing persistent in this module yet; claim an empty object.
            if (!state[module]) state[module] = {}
            if (moduleState.restore) mergeDeep(state[module], moduleState.restore)
        }
    }
    // app.logger.debug(`load previous state from session "${sessionId}"`)
    return state
}
