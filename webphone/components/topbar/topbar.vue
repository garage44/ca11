<component class="c-menu-call">
    <div class="call-directions">
        <button
            :data-tooltip="$t('accept call')"
            :disabled="!description.endpoint"
            @click="callDescription({description})"
            class="btn btn-menu tooltip tooltip-left hint"
        >
            <icon name="call-outgoing" />
        </button>

        <div class="call-endpoint">
            <span v-if="call">
                <span v-if="call.name" class="phone-id">{{ call.name }} - </span>
                <span class="phone-id">{{ call.endpoint }}</span>
            </span>
            <TopbarCallEndpoint v-else />
        </div>
    </div>

    <TopbarCallOptions v-if="callActive" :call="callActive" />
    <TopbarSignallingStatus />
</component>
