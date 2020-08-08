<component class="c-radio field">
    <template v-for="option in options">
        <input
            :checked="option.value === value"
            :class="`radio-${option.value}`"
            :disabled="option.disabled"
            :id="option.value"
            :name="`${name}-${postfix}`"
            :value="option.value"
            @change="updateModel($event)"
            type="radio"
        >

        <label
            class="uc" :class="`label-${option.value}`"
            :for="option.value"
        >
            <icon v-if="option.icon" :name="option.icon" />
            <span v-else>{{ option.name }}</span>

        </label>
    </template>
</component>
