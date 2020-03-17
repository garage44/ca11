<component class="c-radio field">

    <template v-for="option in options">
        <input
            type="radio"
            :class="`radio-${option.value}`"
            :checked="option.value === value"
            :disabled="option.disabled"
            :id="option.value"
            :name="`${name}-${postfix}`"
            :value="option.value"
            @change="updateModel($event)">

        <label class="uc" :class="`label-${option.value}`"
            :for="option.value">
            <icon v-if="option.icon" :name="option.icon"/>
            <span v-else>{{option.name}}</span>

        </label>
    </template>
</component>
