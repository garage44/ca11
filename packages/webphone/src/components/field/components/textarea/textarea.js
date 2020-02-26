export default (app, base) => {
    /**
    * @memberof fg.components
    */
    const FieldTextarea = {
        extends: base,
        methods: {
            updateModel: function(event) {
                this.$emit('input', event.target.value)
            },
        },
    }

    return FieldTextarea
}
