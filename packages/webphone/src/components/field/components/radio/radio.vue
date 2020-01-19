<div class="c-radio field">
    <template v-for="option in options">
        <input
            type="radio"
            :checked="option.value === value"
            :disabled="option.disabled"
            :id="option.value"
            :name="name"
            :value="option.value"
            @change="updateModel($event)">

        <label class="uc" :class="`${elementclass}-${option.value}`"
            :for="option.value">
            <icon v-if="option.icon" :name="option.icon"/>
            <span v-else>{{option.name}}</span>

        </label>
    </template>

</div>
