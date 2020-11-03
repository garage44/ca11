<component class="c-menu-call">
    <div class="call-direction">
        <icon :name="`call-${call.direction}`" v-if="call" />
        <button
            v-else
            class="btn btn-menu tooltip tooltip-left hint"
            :data-tooltip="$t('accept call')"
            :disabled="!description.endpoint"
            @click="callDescription({description})"
        >
            <icon name="call-outgoing" />
        </button>
    </div>

    <div class="call-endpoint">
        <span v-if="call">
            <span v-if="call.name" class="phone-id">{{ call.name }} - </span>
            <span class="phone-id">{{ call.endpoint }}</span>
        </span>
        <DialerEndpoint v-else />
    </div>

    <MenuCallOptions v-if="callActive" :call="callActive" />
    <div v-if="callActive" class="call-status">
        <span class="timer">{{ sessionTime }}</span>
        <span>{{ callStatus }}</span>
        <ProtocolStatus protocol="description.protocol" />
    </div>
    <div v-else class="call-status">
        <span>{{ $t('new call') }}</span>
        <ProtocolStatus protocol="description.protocol" />
    </div>
</component>
