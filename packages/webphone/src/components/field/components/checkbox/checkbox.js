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
        render: templates.field_checkbox.r,
        staticRenderFns: templates.field_checkbox.s,
    }

    return FieldCheckbox
}
