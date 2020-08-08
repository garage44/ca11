<component class="c-devices-config">
    <div class="tip">
        <icon name="school" />
        {{ $t('use a headset or earbuds for better sound quality').ca() }}
    </div>

    <FieldSelect
        v-model="devices.sinks.headsetInput"
        elementclass="t-sel-headset-input"
        :help="$t('does the microphone pick up sound?')"
        :label="$t('microphone')"
        name="headset_input"
        :options="devices.input"
        :validation="$v.settings.webrtc.devices.sinks.headsetInput.valid"
    >
        <div slot="context">
            <Soundmeter v-if="stream[stream.type].id" class="soundmeter" :stream="stream[stream.type]" />
        </div>
    </FieldSelect>

    <FieldSelect
        v-model="devices.sinks.headsetOutput"
        elementclass="t-sel-headset-output"
        :help="$v.settings.webrtc.devices.sinks.headsetOutput.valid.customValid ? $t('does the sound play on the expected device?') : ''"
        :label="$t('headset audio')"
        name="headset_output"
        :options="devices.output"
        :validation="$v.settings.webrtc.devices.sinks.headsetOutput.valid"
    >
        <button
            slot="button"
            class="button"
            :disabled="playing.headsetOutput"
            @click="playSound('busyTone', 'headsetOutput')"
        >
            <icon name="call-active" />
        </button>
    </FieldSelect>

    <FieldSelect
        v-model="devices.sinks.ringOutput"
        elementclass="t-sel-ring-output"
        :help="$v.settings.webrtc.devices.sinks.ringOutput.valid.customValid ? $t('does the sound play on the expected device?') : ''"
        :label="$t('ringtone audio')"
        name="ring_output"
        :options="devices.output"
        :validation="$v.settings.webrtc.devices.sinks.ringOutput.valid"
    >
        <button
            slot="button"
            class="button"
            :disabled="playing.headsetOutput"
            @click="playSound('busyTone', 'headsetOutput')"
        >
            <icon name="call-active" />
        </button>
    </FieldSelect>
</component>
