<component class="c-input-endpoint">
    <input
        ref="input"
        :placeholder="`${description.protocol}://`"
        autocomplete="off"
        name="number-input"
        type="text"
        v-model="description.endpoint"
    >

    <button
        class="back-button"
        @click="removeLastChar"
    >
        <icon name="backspace" />
    </button>
</component>
