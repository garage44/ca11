<div class="c-checkbox field">
    <div class="field__row">
        <label
            :for="name"
            class="c-checkbox__switch"
            :class="elementclass"
        >
            <input
                class="c-checkbox__input"
                :class="elementclass"
                type="checkbox"
                :checked="value"
                :disabled="disabled"
                :id="name"
                :name="name"
                @change="updateModel($event)"
            />
            <span class="c-checkbox__slider"/>
        </label>
        <div class="field__label">
            {{label}}
        </div>
    </div>
    <div v-if="help && !invalidFieldValue" class="c-checkbox__help field__help cf" >{{help}}</div>
    <slot class="c-checkbox__extra" name="extra"></slot>
    <ul v-if="invalidFieldValue" v-html="validationMessage" class="c-checkbox__invalid"></ul>
</div>
