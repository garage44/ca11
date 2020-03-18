export default () => {
    /**
    * @memberof fg.components
    */
    const CallInputEndpoint = {
        methods: {
            removeLastChar: function() {
                this.description.endpoint = this.description.endpoint.substring(0, this.description.endpoint.length - 1)
            },
        },
        store: {
            description: 'caller.description',
        },
    }

    return CallInputEndpoint
}
