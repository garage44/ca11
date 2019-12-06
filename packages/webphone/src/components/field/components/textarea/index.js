module.exports = (app, base) => {
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
        render: templates.field_textarea.r,
        staticRenderFns: templates.field_textarea.s,
    }

    return FieldTextarea
}
