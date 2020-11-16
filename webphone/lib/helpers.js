function helpers(app) {

    const closingStatus = ['answered_elsewhere', 'caller_unavailable', 'callee_busy', 'bye']
    let _helpers = {}

    _helpers.callActive = function() {
        let callActive = false

        for (const id of Object.keys(this.calls)) {
            if (this.calls[id].active) callActive = this.calls[id]
        }

        return callActive
    }


    _helpers.callActiveOngoing = function() {
        let callActive = false

        for (const call of Object.values(this.calls)) {
            if (call.active && call.status !== 'bye') callActive = call
        }

        return callActive
    }


    _helpers.callAccepted = function() {
        let accepted = false
        const calls = app.state.caller.calls

        for (const callId of Object.keys(calls)) {
            const status = calls[callId].status
            // An active Call is not a new Call, but may be a closing Call.
            if (status === 'accepted') accepted = true
        }

        return accepted
    }


    _helpers.callsExist = function() {
        return Boolean(Object.keys(this.calls).length)
    }


    _helpers.callingDisabled = function() {
        let errors = []

        const protocol = app.state.caller.description.protocol

        if (!app.state.app.online) errors.push('offline')
        else {
            if (!app.state.settings.webrtc.media.permission) errors.push('mediaPermission')
            if (!(app.state.settings.webrtc.devices.ready)) errors.push('device')
        }

        if (!['loading', 'registered'].includes(app.state[protocol].status)) {
            errors.push('disconnected')
        }

        if (!errors.length) return false
        else return errors
    }


    _helpers.callsClosing = function() {
        const calls = app.state.caller.calls
        return Object.keys(calls).filter((i) => closingStatus.includes(calls[i].status))
    }


    _helpers.callOngoing = function() {
        for (const call of Object.values(app.state.caller.calls)) {
            if (call.status === 'accepted') return true
        }

        return false
    }


    _helpers.callsReady = function() {
        let ready = true
        const callIds = Object.keys(app.state.caller.calls)
        for (let callId of callIds) {
            if (!['accepted', 'new'].includes(this.calls[callId].status)) {
                ready = false
            }
        }
        return ready
    }


    _helpers.getTranslations = function() {
        const $t = app.$t
        return {
            // Map between CA11 status codes and human translation.
            call: {
                accepted: $t('talking'),
                answered_elsewhere: $t('answered elsewhere'),
                bye: $t('hung up'),
                callee_busy: $t('busy'),
                callee_unavailable: $t('unavailable'),
                caller_unavailable: $t('unavailable'),
                create: $t('setup'),
                hold: $t('on hold'),
                invite: $t('ringing'),
                media: $t('open media'),
            },
            callingDisabled: {
                device: $t('audio device settings - invalid audio device').ca(),
                disconnected: $t('not connected to service').ca(), // Non-WebRTC status.
                mediaPermission: $t('microphone access denied').ca(),
                offline: $t('internet connection is offline').ca(),
                unregistered: $t('not registered at service').ca(),
            },
        }
    }


    _helpers.matchContact = function(number, partial = false) {
        const contacts = app.state.contacts.contacts
        for (const contactId of Object.keys(contacts)) {
            for (const endpointId of Object.keys(contacts[contactId].endpoints)) {
                const endpoint = contacts[contactId].endpoints[endpointId]
                if (partial) {
                    if (String(endpoint.number).includes(number)) {
                        return {contact: contacts[contactId].id, endpoint: endpoint.id}
                    }
                } else {
                    if (String(endpoint.number) === number) return {contact: contacts[contactId].id, endpoint: endpoint.id}
                }
            }
        }

        return null
    }


    _helpers.openTab = function(url) {
        window.open(url, '_blank')
    }


    _helpers.sharedMethods = function() {
        return {
            getTranslations: _helpers.getTranslations,
            openTab: _helpers.openTab,
            playSound: function(soundName, sinkTarget) {
                this.playing[sinkTarget] = true

                if (app.sounds[soundName].off) {
                    // Prevent frenzy-clicking the test-audio button.
                    if (app.sounds[soundName].playing) return

                    app.sounds[soundName].play(false, this.devices.sinks[sinkTarget])
                    app.sounds[soundName].off('stop').on('stop', () => {
                        this.playing[sinkTarget] = false
                    })
                } else {
                    // Prevent frenzy-clicking the test-audio button.
                    if (app.sounds[soundName].started) return

                    app.sounds[soundName].play(this.devices.sinks[sinkTarget])
                    setTimeout(() => {
                        app.sounds[soundName].stop()
                        this.playing[sinkTarget] = false
                    }, 2500)
                }
            },
            setLayer: function(layerName) {
                app.logger.info(`switching layer to ${layerName}`)
                // Haptic feedback for mobile devices.
                navigator.vibrate(50)
                app.setState({ui: {layer: layerName}}, {encrypt: false, persist: true})
            },
            setTab: function(category, tab, subtab = null) {
                if (subtab) {
                    app.setState({ui: {tabs: {[category]: {active: tab, subtabs: {[tab]: {active: subtab}}}}}}, {encrypt: false, persist: true})
                } else {
                    app.setState({ui: {tabs: {[category]: {active: tab}}}}, {encrypt: false, persist: true})
                }
            },
            setupCall: function(description) {
                app.modules.caller.call({description, start: true, transfer: false})
                // Clean up the number so it is gone when the keypad reappears after the call.
                description.number = ''
            },
            toggleEditMode: function() {
                navigator.vibrate(250)
                app.setState({app: {editMode: !app.state.app.editMode}}, {persist: true})
            },
            translations: function(category, key) {
                if (!this._translations) this._translations = this.getTranslations()
                return this._translations[category][key]
            },
        }
    }


    _helpers.sharedComputed = function() {
        return {
            callAccepted: _helpers.callAccepted,
            callActive: _helpers.callActive,
            callingDisabled: _helpers.callingDisabled,
            callOngoing: _helpers.callOngoing,
            callsExist: _helpers.callsExist,
            callsReady: _helpers.callsReady,
            transferStatus: function() {
                let transferStatus = false
                const calls = this.$store.caller.calls
                const callKeys = Object.keys(calls)

                for (let callId of callKeys) {
                    if (calls[callId].transfer.active) {
                        transferStatus = 'select'
                    }
                }
                return transferStatus
            },
        }
    }


    _helpers.validators = {
        // Regex source: https://github.com/johnotander/domain-regex/blob/master/index.js
        domain: function(e) {
            e = e ? e : ''
            let res = e.match(/\b((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\b/)
            if (!res) return false
            return true
        },
    }

    return _helpers
}

export default helpers
