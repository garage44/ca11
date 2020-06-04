import Call from '../lib/call.js'
import Module from '../lib/module.js'


class ModuleCaller extends Module {

    constructor(app) {
        super(app)
        this.calls = {}

        this.reconnect = true
        // The default connection timeout to start with.
        this.retryDefault = {interval: 250, limit: 10000, timeout: 250}
        // Used to store retry state.
        this.retry = Object.assign({}, this.retryDefault)

        this.app.on('caller:call-activate', ({callId, holdInactive, unholdActive}) => {
            let call = null
            if (callId) call = this.calls[callId]

            this.activateCall(call, holdInactive, unholdActive)
        })

        this.app.on('caller:call-hold', ({callId}) => {
            const call = this.calls[callId]
            if (!call.state.hold.active) {
                call.hold()
            } else {
                // Unhold while the call's transfer is active must also
                // undo the previously set transfer state on this call and
                // on others.
                if (call.state.transfer.active) {
                    // Unset the transfer state when it was active during an unhold.
                    this.transferState(call, !call.state.transfer.active)
                }
                this.activateCall(call, true, true)
            }
        })


        this.app.on('caller:call-mute', ({callId}) => {
            const call = this.calls[callId]
            const rtpSenderTrack = call.pc.getSenders()[0].track

            if (!call.state.mute.active) {
                call.setState({mute: {active: true}})
                rtpSenderTrack.enabled = false
            } else {
                call.setState({mute: {active: false}})
                rtpSenderTrack.enabled = true
            }
        })


        this.app.on('caller:transfer-finalize', ({callId}) => {
            // Find origin.
            let sourceCall
            for (const _callId of Object.keys(this.calls)) {
                if (this.calls[_callId].state.transfer.active) {
                    sourceCall = this.calls[_callId]
                }
            }
            sourceCall.transfer(this.calls[callId])
        })


        /**
         * Toggle hold for the call that needs to be transferred.
         * Set transfer mode to active for this call.
         * @event module:ModuleCalls#caller:transfer-initialize
         * @property {callId} callId - Id of the Call to toggle transfer mode for.
         */
        this.app.on('caller:transfer-initialize', ({callId}) => {
            const sourceCall = this.calls[callId]
            this.transferState(sourceCall, !sourceCall.state.transfer.active)
        })
    }


    _initialState() {
        return {
            calls: {},
            description: {
                endpoint: '',
                protocol: 'sig11',
            },
        }
    }


    _ready() {
        let state = {}
        if (!this.app.state.app.online) state.caller = {status: null}

        if (this.app.env.isTel) {
            state.ui = {layer: 'caller'}
            state.caller = {description: {endpoint: this.app.env.isTel}}
            state.sig11 = {network: {view: false}}
        }

        this.app.setState(state)
    }


    _restoreState(moduleStore) {
        this.app._mergeDeep(moduleStore, {
            calls: {},
            sig11: {
                status: 'loading',
            },
            sip: {
                status: 'loading',
            },
        })
    }


    activateCall(call, holdOthers = true, unholdOwn = false) {
        const callIds = Object.keys(this.calls)

        if (!call) {
            // Deactivate all calls.
            for (const callId of callIds) {
                let _call = this.calls[callId]
                _call.setState({active: false})
            }
        }

        for (const callId of Object.keys(this.calls)) {
            let _call = this.calls[callId]
            // A call that is closing. Don't bother changing hold
            // and active state properties.
            if (call && call.id === callId) {
                call.setState({active: true})
                // Only unhold calls that are in the right state.
                if (unholdOwn && _call.state.status === 'accepted') {
                    _call.unhold()
                }
            } else {
                _call.setState({active: false})
                // Only hold calls that are in the right state.
                if (holdOthers && _call.state.status === 'accepted') {
                    _call.hold()
                }
            }
        }

        return call
    }


    call({description}) {
        description.direction = 'outgoing'

        const call = this.spawnCall(description)
        call.initOutgoing()
        // Sync the transfer state of other calls to the new situation.
        this.transferState()

        // A newly created call is always activated unless another call is already ringing.
        if (!Object.keys(this.calls).find((i) => ['create', 'invite'].includes(this.calls[i].state.status))) {
            this.activateCall(call, true, true)
        }

        this.app.setState({caller: {description: {endpoint: null}}})
    }


    deleteCall(call) {
        // This call is getting cleaned up; move to a different call
        // when this call was the active call.
        if (call.state.active) {
            let newcallActive = null
            let fallbackCall = null
            for (const callId of Object.keys(this.calls)) {
                // We are not going to activate the Call we are deleting.
                if (callId === call.id) continue

                // Prefer not to switch to a call that is already closing.
                if (['answered_elsewhere', 'bye', 'caller_unavailable', 'callee_busy'].includes(this.calls[callId].state.status)) {
                    // The fallback Call is a non-specific closing call.
                    if (this.calls[callId]) fallbackCall = this.calls[callId]
                } else {
                    newcallActive = this.calls[callId]
                    break
                }
            }

            // Select the first closing Call when all Calls are closing.
            if (newcallActive) this.activateCall(newcallActive, true, false)
            else if (fallbackCall) this.activateCall(fallbackCall, true, false)
            else {
                // No more calls active; fallback to the dialer.
                this.app.setState({ui: {layer: 'dialer'}}, {encrypt: false, persist: true})
            }
        }

        // Finally delete the call and its references.
        this.app.logger.debug(`${this}delete call ${call.id}`)
        this.app.setState(null, {action: 'delete', path: `caller.calls.${call.id}`})
        delete this.calls[call.id]
    }


    findCall({active = false, ongoing = false} = {}) {
        let matchedCall = null
        for (const callId of Object.keys(this.calls)) {
            // Don't select a call that is already closing.
            if (active) {
                if (this.calls[callId].state.active) {
                    if (ongoing) {
                        if (this.calls[callId].state.status === 'accepted') matchedCall = this.calls[callId]
                    } else {
                        matchedCall = this.calls[callId]
                    }
                }
            } else {
                if (ongoing) {
                    if (this.calls[callId].state.status === 'accepted') matchedCall = this.calls[callId]
                }
            }
        }
        return matchedCall
    }


    spawnCall(description) {
        const desc = this.app.utils.copyObject(description)
        this.app.logger.debug(`${this}spawn new ${description.protocol} call`)
        const call = new Call(this.app, desc)

        this.calls[call.state.id] = call

        call.state.endpoint = desc.endpoint
        call.setState(call.state)

        this.app.Vue.set(this.app.state.caller.calls, call.state.id, call.state)

        return call
    }


    toString() {
        return `${this.app}[mod-caller] `
    }


    transferState(sourceCall = {id: null}, active) {
        const callIds = Object.keys(this.calls)
        // Look for an active transfer call when the source call isn't
        // passed as a parameter.
        if (!sourceCall.id) {
            for (let _callId of callIds) {
                if (this.calls[_callId].state.transfer.active) {
                    sourceCall = this.calls[_callId]
                    // In this case we are not toggling the active status;
                    // just updating the status of other calls.
                    active = true
                    break
                }
            }
        }

        // Still no sourceCall. There is no transfer active at the moment.
        // Force all calls to deactivate their transfer.
        if (!sourceCall.id) active = false

        if (active) {
            // Enable transfer mode.
            if (sourceCall.id) {
                // Always disable the keypad, set the sourceCall on-hold and
                // switch to the default `attended` mode when activating
                // transfer mode on a call.
                sourceCall.setState({keypad: {active: false, endpoint: ''}, transfer: {active: true, type: 'attended'}})
                sourceCall.hold()
            }
            // Set attended status on other calls.
            for (let _callId of callIds) {
                const _call = this.calls[_callId]
                if (_callId !== sourceCall.id) {
                    _call.setState({transfer: {active: false, type: 'accept'}})
                    // Hold all other ongoing calls.
                    if (!['create', 'invite'].includes(_call.state.status) && !_call.state.hold) {
                        _call.hold()
                    }
                }
            }
        } else {
            // Disable transfer mode.
            if (sourceCall.id) {
                sourceCall.setState({transfer: {active: false, type: 'attended'}})
                sourceCall.unhold()
            }
            // Set the correct state of all other calls; se the transfer
            // type to accept and disable transfer modus..
            for (let _callId of callIds) {
                const _call = this.calls[_callId]
                if (_callId !== sourceCall.id) {
                    this.calls[_callId].setState({transfer: {active: false, type: null}})
                    // Make sure all other ongoing calls stay on hold.
                    if (!['create', 'invite'].includes(_call.state.status) && !_call.state.hold) {
                        _call.hold()
                    }
                }
            }
        }
    }
}

export default ModuleCaller
