<StreamView v-if="callActive && !callActive.keypad.active" :call="callActive"/>
<component v-else class="c-caller t-caller module" :class="classes('component')">
    <panel>
        <div v-if="!callActive" class="actions">
            <button
                class="action button btn-menu t-btn-options-call-start tooltip tooltip-bottom"
                :data-tooltip="$t('start new call')"
                :disabled="!description.endpoint"
                @click="callDescription({description})"
            >
                <icon name="phone" />
            </button>

            <ProtocolStatus />
        </div>
    </panel>

    <content class="no-padding">
        <CallInputEndpoint v-if="!callActive" />
        <CallKeypad
            :call="callActive"
            :endpoint="description.endpoint"
            :mode="callActive ? 'dtmf' : 'call'"
            :model.sync="description.endpoint"
        />
    </content>
</component>
