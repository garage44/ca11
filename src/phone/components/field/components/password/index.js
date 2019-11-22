module.exports = (app, base) => {
    /**
    * @memberof fg.components
    */
    const FieldPassword = {
        data: function() {
            return {
                visible: false,
            }
        },
        extends: base,
        methods: {
            toggleVisible() {
                this.visible = !this.visible
            },
        },
        mounted() {
            if (this.autofocus) {
                this.$nextTick(() => this.$refs.input.focus())
            }
        },
        render: templates.field_password.r,
        staticRenderFns: templates.field_password.s,
    }

    return FieldPassword
}
