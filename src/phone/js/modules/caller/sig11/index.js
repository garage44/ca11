const SIG11Call = require('./call')


/**
 * Manage SIG11 calls.
 * @module SIG11Caller
 */
class SIG11Caller {

    constructor(app, plugin) {
        this.app = app
        this.plugin = plugin

        /**
         * Remote node signalled that the call is accepted.
         */
        this.app.on('sig11:call-answer', ({answer, callId, nodeId}) => {
            plugin.calls[callId].setupAnswer(answer)
        })


        // Candidates from initiating caller, sent after it got the
        // confirmation that the call was accepted.
        this.app.on('sig11:call-candidate', ({callId, candidate, nodeId}) => {
            // Only accept candidates for a valid call.
            if (!plugin.calls[callId]) return
            if (plugin.calls[callId].state.status === 'bye') return

            const pc = plugin.calls[callId].pc
            // The RTCPeerConnection is not available in the early
            // state of a call. Candidates are temporarily stored to
            // be processed when the RTCPeerConnection is made.
            if (pc && candidate) pc.addIceCandidate(new RTCIceCandidate(candidate))
            else {
                plugin.calls[callId].candidates.push(candidate)
            }
        })


        /**
         * An incoming call, a 'Call offer', is coming in from
         * a remote node. A new incoming call will show up.
         */
        this.app.on('sig11:call-offer', ({callId, nodeId, offer}) => {
            const node = this.app.sig11.network.node(nodeId)
            const description = {direction: 'incoming', id: callId, node, offer}
            // For now, don't support call waiting and abandon the incoming
            // call when there is already a call going on.
            if (Object.keys(plugin.calls).length) {
                this.app.sig11.emit(nodeId, 'call-terminate', {callId, status: 'callee_busy'})
                return
            }

            const call = new SIG11Call(this.app, description)
            this.app.logger.info(`${this}incoming call ${callId}:${nodeId}`)

            Vue.set(this.app.state.caller.calls, call.id, call.state)
            plugin.calls[call.id] = call

            call.start()
        })


        this.app.on('sig11:call-terminate', ({callId, status}) => {
            plugin.calls[callId].terminate(status, {remote: false})
        })
    }


    call(description) {
        // Search node that has the appropriate number.
        let node = this.app.sig11.network.filterNode({number: description.number})
        if (!node.length) return null
        description.node = node[0]

        return new SIG11Call(this.app, description)
    }


    /**
    * Generate a representational name for this module. Used for logging.
    * @returns {String} - An identifier for this module.
    */
    toString() {
        return `${this.app}[caller][sig11] `
    }
}

module.exports = SIG11Caller
