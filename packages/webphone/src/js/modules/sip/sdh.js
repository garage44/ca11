// Based on https://raw.githubusercontent.com/onsip/SIP.js/0.11.6/src/Web/SessionDescriptionHandler.js
// LICENSE: https://github.com/onsip/SIP.js/blob/master/LICENSE
import SIP from 'sip.js/dist/sip.js'
import SessionDescriptionHandlerObserver from 'sip.js/src/Web/SessionDescriptionHandlerObserver.js'
import sdpInterop from 'sdp-interop-sl'


const iceStates = {
    checking: 'iceConnectionChecking',
    closed: 'iceConnectionClosed',
    completed: 'iceConnectionCompleted',
    connected: 'iceConnectionConnected',
    disconnected: 'iceConnectionDisconnected',
    failed: 'iceConnectionFailed',
    new: 'iceConnection',
}


var SessionDescriptionHandler = function(logger, observer, options) {
    // TODO: Validate the options
    this.options = options || {}

    this.logger = logger
    this.observer = observer
    this.dtmfSender = null
    this.shouldAcquireMedia = true

    this.CONTENT_TYPE = 'application/sdp'

    this.C = {}
    this.C.DIRECTION = {
        INACTIVE: 'inactive',
        NULL: null,
        RECVONLY: 'recvonly',
        SENDONLY: 'sendonly',
        SENDRECV: 'sendrecv',
    }

    this.direction = this.C.DIRECTION.NULL

    this.modifiers = this.options.modifiers || []
    if (!Array.isArray(this.modifiers)) {
        this.modifiers = [this.modifiers]
    }

    var environment = globalThis.window || global
    this.WebRTC = {
        getUserMedia: environment.navigator.mediaDevices.getUserMedia.bind(environment.navigator.mediaDevices),
        MediaStream: environment.MediaStream,
        RTCPeerConnection: environment.RTCPeerConnection,
    }

    this.iceGatheringDeferred = null
    this.iceGatheringTimeout = false
    this.iceGatheringTimer = null

    this.initPeerConnection(this.options.peerConnectionOptions)
    this.constraints = this.checkAndDefaultConstraints(this.options.constraints)
}


SessionDescriptionHandler.defaultFactory = function defaultFactory(session, options) {
    var logger = session.ua.getLogger('sip.invitecontext.sessionDescriptionHandler', session.id)

    var observer = new SessionDescriptionHandlerObserver(session, options)
    // Create a new interop object for every new session,
    // otherwise sdp-interop's cache gets corrupted.
    observer.interop = sdpInterop.InteropChrome()
    // Pass the app object to the observer and
    // delete it from options, before it is parsed
    // to json.
    observer.app = options.app
    delete options.app
    return new SessionDescriptionHandler(logger, observer, options)
}

SessionDescriptionHandler.prototype = Object.create(SIP.SessionDescriptionHandler.prototype, {
    acquire: {
        value: function acquire(constraints) {
            // Default audio & video to true
            constraints = this.checkAndDefaultConstraints(constraints)

            return new Promise(function(resolve, reject) {
                this.emit('userMediaRequest', constraints)

                if (constraints.audio || constraints.video) {
                    // Instead of acquiring media here, we
                    // pass the already acquired stream from
                    // CA11.
                    const app = this.observer.app
                    const streamState = app.state.settings.webrtc.media.stream
                    const localStreamId = streamState[streamState.type].id
                    resolve(app.media.streams[localStreamId])
                } else {
                    // Local streams were explicitly excluded.
                    resolve([])
                }
            }.bind(this))
                .catch((e) => {
                    // TODO: This propogates downwards
                    if (e instanceof SIP.Exceptions.SessionDescriptionHandlerError) {
                        throw e
                    }
                    const error = new SIP.Exceptions.SessionDescriptionHandlerError('acquire', e, 'unable to acquire streams')
                    this.logger.error(error.message)
                    this.logger.error(error.error)
                    throw error
                })
                .then(function acquireSucceeded(streams) {
                    this.logger.log('acquired local media streams')
                    try {
                        // Remove old tracks
                        if (this.peerConnection.removeTrack) {
                            this.peerConnection.getSenders().forEach(function(sender) {
                                this.peerConnection.removeTrack(sender)
                            }, this)
                        }
                        return streams
                    } catch (e) {
                        return SIP.Utils.Promise.reject(e)
                    }
                }.bind(this))
                .catch((e) => {
                    if (e instanceof SIP.Exceptions.SessionDescriptionHandlerError) {
                        throw e
                    }
                    const error = new SIP.Exceptions.SessionDescriptionHandlerError('acquire', e, 'error removing streams')
                    this.logger.error(error.message)
                    this.logger.error(error.error)
                    throw error
                })
                .then(function addStreams(streams) {
                    try {
                        streams = [].concat(streams)
                        streams.forEach(function(stream) {
                            stream.getTracks().forEach(function(track) {
                                this.peerConnection.addTrack(track, stream)
                            }, this)
                        }, this)
                    } catch (e) {
                        return SIP.Utils.Promise.reject(e)
                    }
                    return SIP.Utils.Promise.resolve()
                }.bind(this))
                .catch((e) => {
                    if (e instanceof SIP.Exceptions.SessionDescriptionHandlerError) {
                        throw e
                    }
                    const error = new SIP.Exceptions.SessionDescriptionHandlerError('acquire', e, 'error adding stream')
                    this.logger.error(error.message)
                    this.logger.error(error.error)
                    throw error
                })
        },
        writable: true,
    },


    addDefaultIceCheckingTimeout: {
        value: function addDefaultIceCheckingTimeout(peerConnectionOptions) {
            if (peerConnectionOptions.iceCheckingTimeout === undefined) {
                peerConnectionOptions.iceCheckingTimeout = 5000
            }
            return peerConnectionOptions
        },
        writable: true,
    },


    addDefaultIceServers: {
        value: function addDefaultIceServers(rtcConfiguration) {
            if (!rtcConfiguration.iceServers) {
                rtcConfiguration.iceServers = [{urls: 'stun:stun.l.google.com:19302'}]
            }
            return rtcConfiguration
        },
        writable: true,
    },


    checkAndDefaultConstraints: {
        value: function checkAndDefaultConstraints(constraints) {
            var defaultConstraints = {audio: true, video: !this.options.alwaysAcquireMediaFirst}

            constraints = constraints || defaultConstraints
            // Empty object check
            if (Object.keys(constraints).length === 0 && constraints.constructor === Object) {
                return defaultConstraints
            }
            return constraints
        },
        writable: true,
    },


    /**
     * Destructor
     */
    close: {
        value: function() {
            this.logger.log('closing PeerConnection')
            // have to check signalingState since this.close() gets called multiple times
            if (this.peerConnection && this.peerConnection.signalingState !== 'closed') {

                // Keep the local tracks around.
                this.peerConnection.getSenders().forEach(function(sender) {
                    if (sender.track) {
                        // sender.track.stop()
                    }
                })

                // Clear remote tracks.
                this.peerConnection.getReceivers().forEach(function(receiver) {
                    if (receiver.track) {
                        receiver.track.stop()
                    }
                })

                this.resetIceGatheringComplete()
                this.peerConnection.close()
            }
        },
        writable: true,
    },


    createOfferOrAnswer: {
        value: async function createOfferOrAnswer(RTCOfferOptions = {}, modifiers) {
            let methodName, sdp
            const pc = this.peerConnection
            methodName = this.hasOffer('remote') ? 'createAnswer' : 'createOffer'

            try {
                sdp = await pc[methodName](RTCOfferOptions)
            } catch (err) {
                if (err instanceof SIP.Exceptions.SessionDescriptionHandlerError) {
                    throw err
                }
                const error = new SIP.Exceptions.SessionDescriptionHandlerError('createOfferOrAnswer', err, `peerConnection-${methodName} Failed`)
                this.emit(`peerConnection-${methodName} Failed`, error)
                throw error
            }

            sdp = await SIP.Utils.reducePromises(modifiers, this.createRTCSessionDescriptionInit(sdp))
            this.resetIceGatheringComplete()

            try {
                pc.setLocalDescription(sdp)
            } catch (err) {
                if (err instanceof SIP.Exceptions.SessionDescriptionHandlerError) {
                    throw err
                }
                const error = new SIP.Exceptions.SessionDescriptionHandlerError('createOfferOrAnswer', err, 'peerConnection-SetLocalDescriptionFailed')
                this.emit('peerConnection-SetLocalDescriptionFailed', error)
                throw error
            }

            await this.waitForIceGatheringComplete()
            let localDescription = this.createRTCSessionDescriptionInit(this.peerConnection.localDescription)
            localDescription = await SIP.Utils.reducePromises(modifiers, localDescription)

            try {
                this.setDirection(localDescription.sdp)
                return localDescription
            } catch (err) {
                if (err instanceof SIP.Exceptions.SessionDescriptionHandlerError) {
                    throw err
                }
                const error = new SIP.Exceptions.SessionDescriptionHandlerError('createOfferOrAnswer', err)
                this.logger.error(error)
                throw error
            }
        },
        writable: true,
    },


    createRTCSessionDescriptionInit: {
        value: function createRTCSessionDescriptionInit(RTCSessionDescription) {
            return {
                sdp: RTCSessionDescription.sdp,
                type: RTCSessionDescription.type,
            }
        },
        writable: true,
    },


    getDescription: {
        value: async function(options, modifiers) {
            options = options || {}
            if (options.peerConnectionOptions) {
                this.initPeerConnection(options.peerConnectionOptions)
            }

            // Merge passed constraints with saved constraints and save
            var newConstraints = Object.assign({}, this.constraints, options.constraints)
            newConstraints = this.checkAndDefaultConstraints(newConstraints)
            if (JSON.stringify(newConstraints) !== JSON.stringify(this.constraints)) {
                this.constraints = newConstraints
                this.shouldAcquireMedia = true
            }

            modifiers = modifiers || []
            if (!Array.isArray(modifiers)) {
                modifiers = [modifiers]
            }
            modifiers = modifiers.concat(this.modifiers)

            if (this.shouldAcquireMedia) {
                await this.acquire(this.constraints).then(function() {
                    this.shouldAcquireMedia = false
                }.bind(this))
            }

            const description = await this.createOfferOrAnswer(options.RTCOfferOptions, modifiers)
            let desc = new RTCSessionDescription(description)
            description.sdp = this.observer.interop.toUnifiedPlan(desc).sdp

            this.emit('getDescription', description)
            return {
                body: description.sdp,
                contentType: this.CONTENT_TYPE,
            }
        },
        writable: true,
    },

    getDirection: {
        value: function getDirection() {
            return this.direction
        },
        writable: true,
    },

    hasBrowserGetSenderSupport: {
        value: function hasBrowserGetSenderSupport() {
            return Boolean(this.peerConnection.getSenders)
        },
        writable: true,
    },

    hasBrowserTrackSupport: {
        value: function hasBrowserTrackSupport() {
            return Boolean(this.peerConnection.addTrack)
        },
        writable: true,
    },

    /**
     * Check if the Session Description Handler can handle the Content-Type described by a SIP Message
     * @param {String} contentType The content type that is in the SIP Message
     * @returns {boolean}
     */
    hasDescription: {
        value: function hasDescription(contentType) {
            return contentType === this.CONTENT_TYPE
        },
        writable: true,
    },

    hasOffer: {
        value: function hasOffer(where) {
            var offerState = 'have-' + where + '-offer'
            return this.peerConnection.signalingState === offerState
        },
        writable: true,
    },

    /**
     * The modifier that should be used when the session would like to place the call on hold
     * @param {String} [sdp] The description that will be modified
     * @returns {Promise} Promise that resolves with modified SDP
     */
    holdModifier: {
        value: function holdModifier(description) {
            if (!(/a=(sendrecv|sendonly|recvonly|inactive)/).test(description.sdp)) {
                description.sdp = description.sdp.replace(/(m=[^\r]*\r\n)/g, '$1a=sendonly\r\n')
            } else {
                description.sdp = description.sdp.replace(/a=sendrecv\r\n/g, 'a=sendonly\r\n')
                description.sdp = description.sdp.replace(/a=recvonly\r\n/g, 'a=inactive\r\n')
            }

            return Promise.resolve(description)
        },
        writable: true,
    },


    initPeerConnection: {
        value: function initPeerConnection(options) {
            options = options || {}
            options = this.addDefaultIceCheckingTimeout(options)
            options.rtcConfiguration = options.rtcConfiguration || {}
            options.rtcConfiguration = this.addDefaultIceServers(options.rtcConfiguration)
            this.logger.log('initPeerConnection')

            if (this.peerConnection) {
                this.logger.log('Already have a peer connection for this session. Tearing down.')
                this.resetIceGatheringComplete()
                this.peerConnection.close()
            }

            this.peerConnection = new this.WebRTC.RTCPeerConnection(options.rtcConfiguration)
            this.logger.log('New peer connection created')
            this.peerConnection.addEventListener('track', (e) => {
                this.observer.trackAdded()
                this.emit('addTrack')
                this.observer.session.emit('track', e)
            })


            this.peerConnection.onicecandidate = (e) => {
                this.emit('iceCandidate', e)
                if (e.candidate) {
                    this.logger.log('ICE candidate received: ' + (e.candidate.candidate === null ? null : e.candidate.candidate.trim()))
                } else if (e.candidate === null) {
                    // indicates the end of candidate gathering
                    this.logger.log('ICE candidate gathering complete')
                    this.triggerIceGatheringComplete()
                }
            }

            this.peerConnection.onicegatheringstatechange = () => {
                this.logger.log(`RTCIceGatheringState changed: ${this.iceGatheringState}`)
                switch (this.iceGatheringState) {
                    case 'gathering':
                        this.emit('iceGathering', this)
                        if (!this.iceGatheringTimer && options.iceCheckingTimeout) {
                            this.iceGatheringTimeout = false
                            this.iceGatheringTimer = SIP.Timers.setTimeout(() => {
                                this.logger.log('RTCIceChecking Timeout Triggered after ' + options.iceCheckingTimeout + ' milliseconds')
                                this.iceGatheringTimeout = true
                                this.triggerIceGatheringComplete()
                            }, options.iceCheckingTimeout)
                        }
                        break
                    case 'complete':
                        this.triggerIceGatheringComplete()
                        break
                }
            }

            this.peerConnection.oniceconnectionstatechange = () => {
                const stateEvent = iceStates[this.iceConnectionState]
                if (stateEvent) this.emit(stateEvent, this)
                else this.logger.warn('Unknown iceConnection state:', this.iceConnectionState)
            }
        },
        writable: true,
    },

    // ICE gathering state handling
    isIceGatheringComplete: {
        value: function isIceGatheringComplete() {
            return this.peerConnection.iceGatheringState === 'complete' || this.iceGatheringTimeout
        },
        writable: true,
    },

    resetIceGatheringComplete: {
        value: function resetIceGatheringComplete() {
            this.iceGatheringTimeout = false

            if (this.iceGatheringTimer) {
                SIP.Timers.clearTimeout(this.iceGatheringTimer)
                this.iceGatheringTimer = null
            }

            if (this.iceGatheringDeferred) {
                this.iceGatheringDeferred.reject()
                this.iceGatheringDeferred = null
            }
        },
        writable: true,
    },

    /**
     * Send DTMF via RTP (RFC 4733)
     * @param {String} tones A string containing DTMF digits
     * @param {Object} [options] Options object to be used by sendDtmf
     * @returns {boolean} true if DTMF send is successful, false otherwise
     */
    sendDtmf: {
        value: function sendDtmf(tones, options) {
            if (!this.dtmfSender && this.hasBrowserGetSenderSupport()) {
                var senders = this.peerConnection.getSenders()
                if (senders.length > 0) {
                    this.dtmfSender = senders[0].dtmf
                }
            }
            if (!this.dtmfSender && this.hasBrowserTrackSupport()) {
                var streams = this.peerConnection.getLocalStreams()
                if (streams.length > 0) {
                    var audioTracks = streams[0].getAudioTracks()
                    if (audioTracks.length > 0) {
                        this.dtmfSender = this.peerConnection.createDTMFSender(audioTracks[0])
                    }
                }
            }
            if (!this.dtmfSender) {
                return false
            }
            try {
                this.dtmfSender.insertDTMF(tones, options.duration, options.interToneGap)
            } catch (e) {
                if (e.type === 'InvalidStateError' || e.type === 'InvalidCharacterError') {
                    this.logger.error(e)
                    return false
                } else {
                    throw e
                }
            }
            this.logger.log('DTMF sent via RTP: ' + tones.toString())
            return true
        },
        writable: true,
    },

    /**
     * Set the remote description to the underlying media implementation
     * @param {String} sessionDescription - Description provided by a SIP message.
     * @param {Object} [options] Options object to be used by getDescription.
     * @param {MediaStreamConstraints} [options.constraints] MediaStreamConstraints.
     * @param {Object} [options.peerConnectionOptions] - Rrecreate peer connection with the new options.
     * @param {Array} [modifiers] Array with one time use description modifiers
     * @returns {Promise} Promise that resolves once the description is set
     */
    setDescription: {
        value: async function setDescription(sessionDescription, options, modifiers) {
            let modifiedDescription

            options = options || {}
            if (options.peerConnectionOptions) {
                this.initPeerConnection(options.peerConnectionOptions)
            }

            modifiers = modifiers || []
            if (!Array.isArray(modifiers)) {
                modifiers = [modifiers]
            }
            modifiers = modifiers.concat(this.modifiers)

            var description = {
                sdp: sessionDescription,
                type: this.hasOffer('local') ? 'answer' : 'offer',
            }

            if (this.shouldAcquireMedia && this.options.alwaysAcquireMediaFirst) {
                await this.acquire(this.constraints)
                this.shouldAcquireMedia = false
            }

            try {
                modifiedDescription = await SIP.Utils.reducePromises(modifiers, description)
            } catch (err) {
                if (err instanceof SIP.Exceptions.SessionDescriptionHandlerError) {
                    throw err
                }
                const error = new SIP.Exceptions.SessionDescriptionHandlerError('setDescription', err, 'The modifiers did not resolve successfully')
                this.logger.error(error.message)
                this.emit('peerConnection-setRemoteDescriptionFailed', error)
                throw error
            }

            this.emit('setDescription', modifiedDescription)
            let desc = new RTCSessionDescription(description)
            modifiedDescription.sdp = this.observer.interop.toPlanB(desc).sdp
            try {
                await this.peerConnection.setRemoteDescription(modifiedDescription)
            } catch (err) {
                if (err instanceof SIP.Exceptions.SessionDescriptionHandlerError) {
                    throw err
                }
                // Check the original SDP for video, and ensure that we have want to do audio fallback
                if ((/^m=video.+$/gm).test(sessionDescription) && !options.disableAudioFallback) {
                    // Do not try to audio fallback again
                    options.disableAudioFallback = true
                    // Remove video first, then do the other modifiers
                    await this.setDescription(sessionDescription, options, [SIP.Web.Modifiers.stripVideo].concat(modifiers))
                }
                const error = new SIP.Exceptions.SessionDescriptionHandlerError('setDescription', err)
                this.logger.error(error.error)
                this.emit('peerConnection-setRemoteDescriptionFailed', error)
                throw error
            }

            if (this.peerConnection.getReceivers) {
                this.emit('setRemoteDescription', this.peerConnection.getReceivers())
            } else {
                this.emit('setRemoteDescription', this.peerConnection.getRemoteStreams())
            }

            this.emit('confirmed', this)
        },
        writable: true,
    },

    setDirection: {
        value: function setDirection(sdp) {
            var match = sdp.match(/a=(sendrecv|sendonly|recvonly|inactive)/)
            if (match === null) {
                this.direction = this.C.DIRECTION.NULL
                this.observer.directionChanged()
                return
            }
            var direction = match[1]

            // Assume this has to do with being valid for now.
            const validDirections = [
                this.C.DIRECTION.SENDRECV,
                this.C.DIRECTION.SENDONLY,
                this.C.DIRECTION.RECVONLY,
                this.C.DIRECTION.INACTIVE,
            ]

            if (validDirections.includes(direction)) this.direction = direction
            else this.direction = this.C.DIRECTION.NULL
            this.observer.directionChanged()
        },
        writable: true,
    },

    triggerIceGatheringComplete: {
        value: function triggerIceGatheringComplete() {
            if (this.isIceGatheringComplete()) {
                this.emit('iceGatheringComplete', this)

                if (this.iceGatheringTimer) {
                    SIP.Timers.clearTimeout(this.iceGatheringTimer)
                    this.iceGatheringTimer = null
                }

                if (this.iceGatheringDeferred) {
                    this.iceGatheringDeferred.resolve()
                    this.iceGatheringDeferred = null
                }
            }
        },
        writable: true,
    },

    waitForIceGatheringComplete: {
        value: function waitForIceGatheringComplete() {
            if (this.isIceGatheringComplete()) {
                return Promise.resolve()
            } else if (!this.isIceGatheringDeferred) {
                this.iceGatheringDeferred = SIP.Utils.defer()
            }
            return this.iceGatheringDeferred.promise
        },
        writable: true,
    },
})

export default SessionDescriptionHandler
