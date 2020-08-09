<component class="c-endpoint">
    <input
        ref="input"
        :placeholder="`${$t('enter call id')}...`"
        autocomplete="off"
        name="number-input"
        type="text"
        v-model="description.endpoint"
    >
</component>
