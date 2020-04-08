<component class="c-endpoint">
    <input
        ref="input"
        :placeholder="`${description.protocol}://`"
        autocomplete="off"
        name="number-input"
        type="text"
        v-model="description.endpoint"
    >
</component>
