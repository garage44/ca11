<component class="c-endpoint">
    <input
        ref="endpoint"
        :placeholder="`${$t('enter call id')}...`"
        autocomplete="off"
        name="number-input"
        type="text"
        v-model="description.endpoint"
    >
</component>
