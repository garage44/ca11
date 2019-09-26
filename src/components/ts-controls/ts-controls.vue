<component class="c-ts-controls">

    <FieldRadio
        v-model="description.protocol"
        elementclass="t-rd-calls-protocol"
        class="protocol-switch tooltip tooltip-left"
        name="protocol"
        :options="protocols"
        :data-tooltip="tooltip"
    />

    <FieldCheckbox
        v-model="dnd"
        class="tooltip tooltip-left"
        :data-tooltip="$t('do not disturb')"
        name="dnd_availability"
    />

    <CallerSwitcher/>
        <!-- <div class="protocol-status"> -->
<!--
            <button
                v-if="sig11.enabled"
                class="sig11 tooltip tooltip-left"
                :class="`t-st-status-sig11-${sig11.status} ${sip.status}`"
                :data-tooltip="tooltip.sig11"
            >
                <div class="container" :class="classes('sig11')">
                <icon name="mute" v-if="!settings.webrtc.media.permission"/>
                <icon name="mute" v-else-if="!settings.webrtc.devices.ready"/>
                <icon name="spinner" v-else-if="sig11.status === 'loading'" class="spinner"/>
                <icon name="protocol-sig11" v-else/>
                </div>
            </button>

            <button
                v-if="sip.enabled"
                class="tooltip tooltip-left"
                :class="`t-st-status-sip-${sip.status} ${sip.status}`"
                :data-tooltip="tooltip.sip"
            >
                <div class="container" :class="classes('sip')">
                <icon name="mute" v-if="!settings.webrtc.media.permission"/>
                <icon name="mute" v-else-if="!settings.webrtc.devices.ready"/>
                <icon name="spinner" v-else-if="sip.status === 'loading'" class="spinner"/>
                <icon name="protocol-sip" v-else/>
                </div>
            </button> -->
        <!-- </div> -->


    <!-- </div> -->






</component>
