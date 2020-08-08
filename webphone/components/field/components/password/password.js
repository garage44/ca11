export default (app, base) => {
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
    }

    return FieldPassword
}
