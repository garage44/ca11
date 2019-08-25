<component class="c-options">
    <button
        v-if="!call.id && ui.layer === 'caller'"
        :disabled="!description.number"
        class="button button--menu c-options__option t-btn-options-call-start tooltip tooltip-left"
        :data-tooltip="$t('start new call')"
        @click="callDescription({description})"
    ><icon name="phone"/></button>

    <button
        v-if="call.status === 'invite'"
        class="button button--menu c-options__option t-btn-options-call-accept tooltip tooltip-left hint"
        :data-tooltip="$t('accept call')"
        @click="callAccept(call)"
    ><icon name="phone"/></button>

    <button
        v-if="call.id && callCanTerminate"
        class="button button--menu c-options__option t-btn-options-call-hangup tooltip tooltip-left"
        :data-tooltip="$t('end call')"
        @click="callTerminate(call)"
    ><icon name="call-end"/></button>

    <template v-if="call.id && call.status === 'accepted'">

    <button
        v-if="call.protocol === 'sip'"
        class="button button--menu c-options__option tooltip tooltip-left"
        :class="classes('dialpad-button')"
        :data-tooltip="$t('keypad')"
        :disabled="call.status !== 'accepted' || call.transfer.active"
        @click="keypadToggle"
    ><icon name="dialpad"/></button>

    <button
        class="button button--menu c-options__option tooltip tooltip-left"
        :class="classes('hold-button')"
        :data-tooltip="$t('on hold')"
        :disabled="call.status !== 'accepted'"
        @click="holdToggle"
    ><icon name="pause"/></button>

    <button
        v-if="call.protocol === 'sip' && call.transfer.type !== 'accept'"
        class="button button--menu c-options__option t-btn-options-transfer-toggle button tooltip tooltip-left"
        :class="classes('transfer-button')"
        :data-tooltip="$t('transfer {number}', {number: call.number})"
        :disabled="transferDisabled"
        @click="transferToggle"
    ><icon name="transfer"/></button>

    <button
        v-else-if="call.protocol === 'sip'"
        class="button button--menu c-options__option t-btn-options-transfer-finalize button tooltip tooltip-left"
        :data-tooltip="$t('finalize transfer')"
        :disabled="call.status !== 'accepted'"
        @click="transferFinalize"
    ><icon name="merge"/></button>
    </template>

</component>
