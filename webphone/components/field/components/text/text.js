import Field from '../../field.js'


export default {
    extends: Field,
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
