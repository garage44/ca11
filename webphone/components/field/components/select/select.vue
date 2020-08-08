<component class="c-select field" v-click-outside="searchToggle">
    <label
        :class="classes('label')"
        :for="name"
        class="c-select__label field__label"
    >{{label}}</label>

    <div class="c-select__control">
        <div
            class="c-select__element-container"
            v-bind:class="classes('select-search')"
        >
            <input
                ref="input"
                :disabled="disabled"
                :id="name"
                :placeholder="value.id ? value.name : placeholder.capitalize()"
                @click="searchSelect($event, null, null, false)"
                @input="searchSelect($event, null, 'query', false)"
                @keydown.down="searchSelect($event, null, 'down', false)"
                @keydown.page-down="searchSelect($event, null, 'page-down', false)"
                @keydown.page-up="searchSelect($event, null, 'page-up', false)"
                @keydown.up="searchSelect($event, null, 'up', false)"
                @keyup.enter="searchSelect($event, null, 'enter', true)"
                @keyup.escape="visible = false"
                autocomplete="off"
                class="c-select__element field__element"
                readonly="!search"
                v-model="searchQuery"
            >

            <slot class="button" name="button" />
        </div>

        <div
            v-show="visible"
            ref="options"
            class="c-select__options"
            :class="elementclass"
        >
            <div
                v-for="option in filteredOptions"
                v-if="option.id"
                :id="`option-${option.id}`"
                :key="option.id"
                class="option"
                :class="{selected: searchSelected.id === option.id}"
                @click="searchSelect($event, option, null, true)"
            >
                {{ option.name.ca() }}
            </div>
        </div>
    </div>
    <div v-if="help" class="c-select__help field__help cf">
        {{ help }}
    </div>
    <span
        v-if="invalidFieldValue && validationMessage"
        class="validation-message is-danger" v-html="validationMessage"
    />
    <slot name="context" />
</component>
