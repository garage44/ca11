<component class="c-caller t-caller" :class="classes('component')">

    <main class="main">
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
        <!-- starting without any active call -->
        <Keypad
            v-else
            display="touch"
            mode="call"
            :number="description.number"
            :model.sync="description.number"
        />
    </main>
</component>
