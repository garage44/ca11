<component class="c-password field">
    <label :for="name" class="c-password__label field__label">{{label}}</label>
    <div class="c-password__container">
        <input
            :class="elementclass"
            :disabled="disabled"
            :name="name"
            :placeholder="placeholder"
            :type="visible ? 'text' : 'password'"
            :value="value"
            @input="updateModel($event)"
            class="c-password__element field__element"
        >
        <ul class="c-password__invalid field__invalid" v-html="validationMessage" />
        <div
            class="eye"
            :class="{visible}"
            @click="toggleVisible()"
        >
            <icon name="eye" />
        </div>
    </div>
    <div v-if="help" class="c-password__help field__help">
        {{ help }}
    </div>
</component>
