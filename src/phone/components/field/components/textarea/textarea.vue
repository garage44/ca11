<div class="c-textarea field">
    <label class="c-textarea__label field__label ca" :for="name">{{label}}</label>
    <textarea class="c-textarea__element"
        v-autosize="value"
        :disabled="disabled"
        :readonly="readonly"
        :name="name"
        :placeholder="placeholder"
        @input="updateModel($event)"
    >{{value}}</textarea>
    <ul class="c-textarea__invalid" v-html="validationMessage"></ul>
</div>
