<div class="c-text field">
    <label class="c-text__label field__label ca" :for="name">{{label}}</label>
    <div class="c-text__container">
        <input
            class="c-text__element field__element"
            type="text"
            :autofocus="autofocus"
            :class="elementclass"
            :disabled="disabled"
            :name="name"
            :placeholder="placeholder"
            :readonly="readonly"
            :value="value"
            @input="updateModel($event)"
        />
        <ul class="c-text__invalid" v-html="validationMessage"></ul>
    </div>
    <div v-if="help" class="c-text__help field__help cf">{{help}}</div>
</div>
