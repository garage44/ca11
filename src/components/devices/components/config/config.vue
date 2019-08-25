<component class="c-devices-config">

    <div class="tip">
        <icon name="school"/>
        {{$t('use a headset or earbuds for better sound quality').ca()}}
    </div>

    <FieldSelect
        v-model="devices.sinks.headsetInput"
        elementclass="t-sel-headset-input"
        name="headset_input"
        :help="$t('does the microphone of your headset respond?')"
        :label="$t('microphone')"
        :options="devices.input"
        :validation="$v.settings.webrtc.devices.sinks.headsetInput.valid"
    >

        <div slot="context">
            <Soundmeter v-if="stream[stream.type].id" class="soundmeter" :stream="stream[stream.type]"/>
        </div>
    </FieldSelect>

    <FieldSelect
        v-model="devices.sinks.headsetOutput"
        elementclass="t-sel-headset-output"
        name="headset_output"
        :help="$v.settings.webrtc.devices.sinks.headsetOutput.valid.customValid ? $t('does the sound play on the expected device?') : ''"
        :label="$t('headset audio')"
        :options="devices.output"
        :validation="$v.settings.webrtc.devices.sinks.headsetOutput.valid"
    >
        <button
            class="button"
            slot="button"
            :disabled="playing.headsetOutput"
            @click="playSound('busyTone', 'headsetOutput')"
        >
            <icon name="call-active"/>
        </button>
    </FieldSelect>

    <FieldSelect
        v-model="devices.sinks.ringOutput"
        elementclass="t-sel-ring-output"
        name="ring_output"
        :help="$v.settings.webrtc.devices.sinks.ringOutput.valid.customValid ? $t('does the sound play on the expected device?') : ''"
        :label="$t('ringtone audio')"
        :options="devices.output"
        :validation="$v.settings.webrtc.devices.sinks.ringOutput.valid"
    >
        <button
            class="button"
            slot="button"
            :disabled="playing.headsetOutput"
            @click="playSound('busyTone', 'headsetOutput')"
        >
            <icon name="call-active"/>
        </button>
    </FieldSelect>
</component>
