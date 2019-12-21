<component class="c-caller t-caller" :class="classes('component')">

    <Call v-if="callActive" :call="callActive"/>
    <StreamView v-else-if="stream[stream.type].selected" :call="null"/>
    <!-- calling disabled -->
    <div v-else-if="callingDisabled" class="call-disabled">
        <icon class="disabled-icon" name="phone"/>
        <div class="disabled-text">
            <span class="cf">{{$t('service unavailable.')}}</span><br/>
            <span class="cf">{{$t('what is wrong?')}}</span>
        </div>
        <div class="disabled-reason">
            <ul>
                <li v-for="reason in callingDisabled">
                    {{translations('callingDisabled', reason)}}
                </li>
            </ul>
        </div>
    </div>
    <!-- Keypad flow without a previous active call -->
    <Keypad
        v-else
        display="touch"
        mode="call"
        :endpoint="description.endpoint"
        :model.sync="description.endpoint"
    />
</component>
