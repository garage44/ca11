module.exports = (app, base) => {
    /**
    * @memberof fg.components
    */
    const FieldText = {
        extends: base,
        methods: {
            updateModel: function(event) {
                this.$emit('input', event.target.value)
            },
        },
        mounted() {
            if (this.autofocus) {
                this.$nextTick(() => this.$refs.input.focus())
            }
        },
        props: {
            value: '',
        },
        render: templates.field_text.r,
        staticRenderFns: templates.field_text.s,
    }

    return FieldText
}
