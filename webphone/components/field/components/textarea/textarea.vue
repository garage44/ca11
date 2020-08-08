<component class="c-textarea field">
    <label :for="name" class="c-textarea__label field__label ca">{{label}}</label>
    <textarea
        :disabled="disabled"
        :name="name"
        :placeholder="placeholder"
        :readonly="readonly"
        @input="updateModel($event)"
        class="c-textarea__element"
        v-autosize="value"
    >{{value}}</textarea>
    <ul class="c-textarea__invalid" v-html="validationMessage" />
</component>
