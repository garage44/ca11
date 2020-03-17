<component class="c-call" :class="`t-st-call-${call.status}`">

    <CallKeypad
        v-if="call.keypad.active"
        mode="dtmf"
        :call="call"
        :endpoint="call.keypad.endpoint"
        :model.sync="call.keypad.endpoint"
    />
    <!-- the default view -->
    <StreamView v-else :call="call"/>
</component>
