<div class="c-password field">
    <label class="c-password__label field__label" :for="name">{{label}}</label>
    <div class="c-password__container">
        <input
            class="c-password__element field__element"
            :disabled="disabled"
            :class="elementclass"
            :name="name"
            :placeholder="placeholder"
            :type="visible ? 'text' : 'password'"
            :value="value"
            @input="updateModel($event)"
        />
        <ul class="c-password__invalid field__invalid" v-html="validationMessage"></ul>
        <div
            class="c-password__eye"
            :class="{visible}"
            @click="toggleVisible()"
        ><icon name="eye"/></div>
    </div>
    <div v-if="help" class="c-password__help field__help">{{help}}</div>
</div>
