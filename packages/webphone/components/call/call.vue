<component :class="`t-st-call-${call.status}`" class="c-call">
    <CallKeypad
        :call="call"
        :endpoint="call.keypad.endpoint"
        :model.sync="call.keypad.endpoint"
        mode="dtmf"
        v-if="call.keypad.active"
    />
    <StreamView v-else :call="call" />
</component>
