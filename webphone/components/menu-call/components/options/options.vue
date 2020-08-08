<component class="c-options">
    <button
        :data-tooltip="$t('accept call')"
        @click="callAccept(call)"
        class="btn btn-menu t-btn-options-call-accept tooltip tooltip-left hint"
        v-if="call.status === 'invite'"
    >
        <icon name="phone" />
    </button>

    <button
        v-if="call.id && callCanTerminate"
        class="btn btn-menu t-btn-options-call-hangup tooltip tooltip-left"
        :data-tooltip="$t('end call')"
        @click="callTerminate(call)"
    >
        <icon name="call-end" />
    </button>

    <template v-if="call.id && call.status === 'accepted'">
        <button
            v-if="call.protocol === 'sip'"
            class="btn btn-menu tooltip tooltip-left"
            :class="classes('dialpad-button')"
            :data-tooltip="$t('keypad')"
            :disabled="call.status !== 'accepted' || call.transfer.active"
            @click="keypadToggle"
        >
            <icon name="dialpad" />
        </button>

        <button
            class="btn btn-menu tooltip tooltip-left"
            :class="classes('hold-button')"
            :data-tooltip="$t('on hold')"
            :disabled="call.status !== 'accepted'"
            @click="holdToggle"
        >
            <icon name="pause" />
        </button>

        <button
            v-if="call.protocol === 'sip' && call.transfer.type !== 'accept'"
            class="btn btn-menu t-btn-options-transfer-toggle tooltip tooltip-left"
            :class="classes('transfer-button')"
            :data-tooltip="$t('transfer {number}', {number: call.number})"
            :disabled="transferDisabled"
            @click="transferToggle"
        >
            <icon name="transfer" />
        </button>

        <button
            v-else-if="call.protocol === 'sip'"
            class="btn btn-menu t-btn-options-transfer-finalize tooltip tooltip-left"
            :data-tooltip="$t('finalize transfer')"
            :disabled="call.status !== 'accepted'"
            @click="transferFinalize"
        >
            <icon name="merge" />
        </button>
    </template>
</component>
