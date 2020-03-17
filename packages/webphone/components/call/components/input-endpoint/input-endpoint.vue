<component class="c-call-input">
    <ProtocolStatus/>

    <input
        v-model="description.endpoint"
        autocomplete="off"
        name="number-input"
        :placeholder="`${description.protocol}://`"
        ref="input"
        type="text"
    />

    <button
        class="back-button"
        @click="removeLastChar">
        <icon name="backspace"/>
    </button>

</component>
