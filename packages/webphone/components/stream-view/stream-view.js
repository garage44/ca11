export default (app) => {
    let slotSize = 6
    let slots = []
    for (let i = 0; i < slotSize; i++) {
        slots.push({id: shortid(), type: 'placeholder'})
    }

    const sharedComputed = app.helpers.sharedComputed()

    return {
        computed: Object.assign({
            /**
             * The selected property is a timestamp when set,
             * so the selected streams can be ordered
             * accordingly.
             * @returns {Array} - Selected streams ordered by selection time.
             */
            callActive: sharedComputed.callActive,
            streams: function() {
                let streams = [this.stream[this.stream.type]]
                streams = streams.concat(Object.values(this.callActive.streams))
                return streams
            },

        }),
        mounted: function() {
            // Start with a selected local stream.
            this.stream.selected = true
        },
        store: {
            calls: 'caller.calls',
            stream: 'settings.webrtc.media.stream',
        },
        watch: {
            callActive: function(callActive) {
                console.log("CALL ACTIVE ", callActive)
            },
        },
    }
}
