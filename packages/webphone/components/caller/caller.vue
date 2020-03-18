<StreamView v-if="callActive && !callActive.keypad.active" :call="callActive"/>
<component v-else class="c-caller t-caller module" :class="classes('component')">

    <panel>
        <div class="actions" v-if="!callActive">
            <button class="action button button--menu t-btn-options-call-start tooltip tooltip-bottom"
                :data-tooltip="$t('start new call')"
                :disabled="!description.endpoint"
                @click="callDescription({description})"
            ><icon name="phone"/></button>

            <ProtocolStatus/>
        </div>
    </panel>

    <content class="no-padding">
        <CallInputEndpoint v-if="!callActive"/>
        <CallKeypad
            :call="callActive"
            :mode="callActive ? 'dtmf' : 'call'"
            :endpoint="description.endpoint"
            :model.sync="description.endpoint"
        />
    </content>
</component>
