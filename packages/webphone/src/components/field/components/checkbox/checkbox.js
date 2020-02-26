export default (app, base) => {
    /**
    * @memberof fg.components
    */
    const FieldCheckbox = {
        extends: base,
        methods: {
            updateModel: function(event) {
                this.$emit('input', event.target.checked)
            },
        },
        props: {
            value: '',
        },
    }

    return FieldCheckbox
}
