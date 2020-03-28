<component :class="classes('component')" class="c-caller t-caller module full-size">
    <!-- <panel>
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
    </panel> -->


    <CallInputEndpoint v-if="!callActive" />
    <CallKeypad
        :call="callActive"
        :endpoint="description.endpoint"
        :mode="callActive ? 'dtmf' : 'call'"
        :model.sync="description.endpoint"
    />
</component>
