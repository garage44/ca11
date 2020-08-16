import Field from '../../field.js'


export default {
    data: function() {
        return {
            visible: false,
        }
    },
    extends: Field,
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

