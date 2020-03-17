<div class="c-checkbox field" :class="componentClass">
    <div class="row">
        <label :for="name" class="switch" :class="elementclass">
            <input
                :class="elementclass"
                type="checkbox"
                :checked="value"
                :disabled="disabled"
                :id="name"
                :name="name"
                @change="updateModel($event)"
            />
            <span class="slider">
                <slot name="icon-disabled"></slot>
                <slot name="icon-enabled"></slot>
            </span>
        </label>
        <div class="field-label">
            {{label}}
        </div>
    </div>
    <div v-if="help && !invalidFieldValue" class="c-checkbox__help field__help cf" >{{help}}</div>
    <slot class="c-checkbox__extra" name="extra"></slot>
    <ul v-if="invalidFieldValue" v-html="validationMessage" class="c-checkbox__invalid"></ul>
</div>
