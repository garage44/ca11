<component class="c-call" :class="`t-st-call-${call.status}`">
    <Keypad
        v-if="call.keypad.active"
        mode="dtmf"
        :call="call"
        :number="call.keypad.number"
        :model.sync="call.keypad.number"
    />
    <!-- the default view -->
    <StreamView v-else :call="call"/>
</component>
