module.exports = (app) => {
    /**
    * @memberof fg.components
    */
    let slotSize = 6
    let slots = []
    for (let i = 0; i < slotSize; i++) {
        slots.push({id: shortid(), type: 'placeholder'})
    }

    const StreamView = {
        computed: Object.assign({
            /**
             * The selected property is a timestamp when set,
             * so the selected streams can be ordered
             * accordingly.
             * @returns {Array} - Selected streams ordered by selection time.
             */
            slots: function() {
                let activeSlots = []

                activeSlots.push(this.stream[this.stream.type])

                if (this.call) {
                    // Replace placeholders with actual streams.
                    const streams = Object.values(this.call.streams)
                    activeSlots = activeSlots.concat(streams)
                    if (activeSlots.length <= 2) return activeSlots
                } else {
                    return activeSlots
                }

                // Use placeholders to indicate capacity for conferencing.
                activeSlots.sort((a, b) => {
                    if (a.selected < b.selected) return -1
                    if (a.selected > b.selected) return 1
                    return 0
                })


                if (activeSlots.length < slotSize) {
                    for (let i = activeSlots.length; i < slotSize; i++) {
                        activeSlots.push(slots[i])
                    }
                }

                return activeSlots
            },
        }, app.helpers.sharedComputed()),
        methods: {
            classes: function(block) {
                const classes = {}
                if (block === 'component') {
                    if (this.slots.length === 1) classes['slots-preview'] = true
                    else if (this.slots.length === 2) classes['slots-call'] = true
                    else classes['slots-conference'] = true
                }
                return classes
            },
        },
        mounted: function() {
            // Start with a selected local stream.
            this.stream.selected = true
        },
        props: ['call'],
        render: templates.stream_view.r,
        staticRenderFns: templates.stream_view.s,
        store: {
            stream: 'settings.webrtc.media.stream',
        },
    }

    return StreamView
}
