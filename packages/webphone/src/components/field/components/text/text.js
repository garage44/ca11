export default (app, base) => {
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
    }

    return FieldText
}
