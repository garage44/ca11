export default () => {
    return {
        mounted: function() {
            this.$refs.endpoint.focus()
        },
        store: {
            description: 'caller.description',
        },
        watch: {
            'description.endpoint': function(endpoint) {
                console.log('ENDPOINT', endpoint)
                const isNumeric = /^\d+$/.test(endpoint)

                if (isNumeric) {
                    this.description.protocol = 'sip'
                } else if (endpoint.length === 64) {
                    this.description.protocol = 'sig11'
                } else {
                    this.description.protocol = 'ion'
                }
                this.description.endpoint = endpoint
            },
        },
    }
}
