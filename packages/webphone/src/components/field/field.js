import FieldCheckbox from './components/checkbox/checkbox.js'
import FieldPassword from './components/password/password.js'
import FieldRadio from './components/radio/radio.js'
import FieldSelect from './components/select/select.js'
import FieldText from './components/text/text.js'
import FieldTextarea from './components/textarea/textarea.js'

export default (app) => {
    /**
    * @memberof fg.components
    */
    const Field = {
        computed: {
            invalidFieldValue: function() {
                if (!this.validation) return null
                if (!this.validation.$dirty) return null
                // Validation for `requiredIf` depends on the state of other
                // fields. Therefor don't use the $dirty check on this field,
                // but go straight for the $invalid state.
                if ('requiredIf' in this.validation) {
                    return this.validation.$invalid
                }

                // Invalid has 3 states: true, false and null (not changed/dirty).
                return this.validation.$error
            },
        },
        methods: {
            classes: function(block) {
                const classes = {}

                if (this.validation) {
                    if (this.validation.required === false || this.validation.required === true) {
                        classes.required = true
                    }
                }

                return classes
            },
            updateModel: function(event) {
                this.$emit('input', event.target.value)
            },
        },
        props: {
            disabled: Boolean,
            elementclass: String,
            help: String,
            label: String,
            name: String,
            placeholder: String,
            readonly: Boolean,
            validation: Object,
            value: '',
        },
    }

    return {
        component: Field,
        components: {
            FieldCheckbox,
            FieldPassword,
            FieldRadio,
            FieldSelect,
            FieldText,
            FieldTextarea,
        }
    }
}
