<component :class="componentClass" class="c-checkbox field">
    <div class="row">
        <label :class="elementclass" :for="name" class="switch">
            <input
                :checked="value"
                :class="elementclass"
                :disabled="disabled"
                :id="name"
                :name="name"
                @change="updateModel($event)"
                type="checkbox"
            >
            <span class="slider">
                <slot name="icon-disabled" />
                <slot name="icon-enabled" />
            </span>
        </label>
        <div class="field-label">
            {{ label }}
        </div>
    </div>
    <div v-if="help && !invalidFieldValue" class="c-checkbox__help field__help cf">
        {{ help }}
    </div>
    <slot class="c-checkbox__extra" name="extra" />
    <ul v-if="invalidFieldValue" class="c-checkbox__invalid" v-html="validationMessage" />
</component>
