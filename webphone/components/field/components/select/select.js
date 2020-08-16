import { copyObject } from '/webphone/lib/utils.js'
import Field from '../../field.js'


export default (app) => {
    return {
        computed: {
            filteredOptions() {
                let filteredOptions = []

                for (const option of this.options) {
                    // Case insensitive search.
                    if (option.name.toLowerCase().includes(this.searchQuery.toLowerCase())) {
                        filteredOptions.push(option)
                    }
                }
                return filteredOptions
            },
        },
        data: function() {
            return {
                searchQuery: '',
                searchSelected: this.value,
                selectedOption: null,
                visible: false,
            }
        },
        extends: Field,
        methods: {
            emptySelectOption: function() {
                // Handle syncing an empty option to the model.
                let emptyOption = {id: null, name: null}
                // Use the first option to determine additional keys.
                if (this.options.length) {
                    for (let key of Object.keys(this.options[0])) {
                        emptyOption[key] = null
                    }
                }
                return emptyOption
            },
            navigate(keyModifier) {
                if (keyModifier === 'enter') {
                    if (!this.searchSelected.id) this.selectedOption = this.filteredOptions[0]
                    else {
                        this.selectedOption = this.searchSelected
                    }
                } else if (['up', 'down', 'page-down', 'page-up'].includes(keyModifier)) {
                    if (!this.searchSelected.id) this.selectedOption = this.filteredOptions[0]
                    else {
                        const itemIndex = this.filteredOptions.findIndex((i) => i.id === this.searchSelected.id)
                        if (keyModifier === 'down' && this.filteredOptions.length > itemIndex) {
                            this.selectedOption = this.filteredOptions[itemIndex + 1]
                        } else if (keyModifier === 'up' && itemIndex > 0) {
                            this.selectedOption = this.filteredOptions[itemIndex - 1]
                        } else if (keyModifier === 'page-down') {
                            if (this.filteredOptions.length >= itemIndex + 5) {
                                this.selectedOption = this.filteredOptions[itemIndex + 5]
                            }
                        } else if (keyModifier === 'page-up') {
                            if (this.filteredOptions.length >= itemIndex - 5 && (itemIndex - 5) >= 0) {
                                this.selectedOption = this.filteredOptions[itemIndex - 5]
                            }
                        }
                    }
                } else if (keyModifier === 'query') {
                    this.selectedOption = this.filteredOptions[0]
                }
            },
            searchSelect(event, option, keyModifier, updateModel) {
                this.visible = true

                if (option) {
                    // Option click select.
                    this.selectedOption = option
                } else if (keyModifier) {
                    this.navigate(keyModifier)
                } else {
                    // Click/focus.
                    if (!this.searchSelected.id) this.selectedOption = this.filteredOptions[0]
                    else this.selectedOption = this.searchSelected
                }

                if (this.selectedOption) {
                    this.searchSelected = this.selectedOption
                    if (updateModel) {
                        this.searchQuery = ''
                        this.visible = false
                        this.searchPlaceholder = this.selectedOption.name
                        this.$emit('input', copyObject(this.selectedOption))
                    } else {
                        this.visible = true
                    }
                }
            },
            searchToggle(event, el, visible) {
                this.visible = visible
            },
            updateModel: function(event) {
                let value = event.target.value
                if (!value) {
                    this.$emit('input', this.emptySelectOption())
                } else {
                    for (const option of this.options) {
                        if (option.id === value) {
                            this.$emit('input', copyObject(option))
                        }
                    }
                }
            },
        },
        props: {
            empty: {
                default: app.$t('no options available'),
                type: String,
            },
            idfield: {
                default: 'id',
            },
            options: {
                default: () => [],
                type: Array,
            },
            placeholder: String,
            search: {
                default: false,
                type: Boolean,
            },
            value: Object,
        },
        updated() {
            const input = this.$refs.input
            const options = this.$refs.options
            let selected
            if (this.searchSelected.id) {
                selected = document.querySelector(`#option-${this.searchSelected.id}`)
            }

            if (selected) {
                options.scrollTop = selected.offsetTop - input.offsetHeight - selected.offsetHeight
            }
        },
    }
}
