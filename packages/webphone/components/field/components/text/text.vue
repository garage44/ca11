<component class="c-text field">
    <label :for="name" class="c-text__label field__label ca">{{label}}</label>
    <div class="c-text__container">
        <input
            :autofocus="autofocus"
            :class="elementclass"
            :disabled="disabled"
            :name="name"
            :placeholder="placeholder"
            :readonly="readonly"
            :value="value"
            @input="updateModel($event)"
            class="c-text__element field__element"
            type="text"
        >
        <ul class="c-text__invalid" v-html="validationMessage" />
    </div>
    <div v-if="help" class="c-text__help field__help cf">
        {{ help }}
    </div>
</component>
