<StreamView v-if="callActive && !callActive.keypad.active" :call="callActive"/>
<component v-else class="c-caller t-caller module" :class="classes('component')">

    <panel>
        <div class="actions">
            <button class="action button button--menu t-btn-options-call-start tooltip tooltip-bottom"
                :data-tooltip="$t('switch media')"
                @click.stop="switchStream()"
            ><icon :name="stream.type"/></button>
            <button class="action button button--menu t-btn-options-call-start tooltip tooltip-bottom"
                :data-tooltip="$t('start new call')"
                :disabled="!description.endpoint"
                @click="callDescription({description})"
            ><icon name="phone"/></button>
        </div>
    </panel>
    <content class="no-padding">

        <CallInputEndpoint/>

        <CallKeypad
            mode="call"
            :endpoint="description.endpoint"
            :model.sync="description.endpoint"
        />
    </content>


    <!-- calling disabled -->
    <!-- <div v-else-if="callingDisabled" class="call-disabled">
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
    </div> -->
    <!-- Keypad flow without a previous active call -->

</component>
