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

        <div class="call-endpoint">
            <span v-if="call">
                <span v-if="call.name" class="phone-id">{{ call.name }} - </span>
                <span class="phone-id">{{ call.endpoint }}</span>
            </span>
            <DialerEndpoint v-else />
        </div>
    </div>


    <TopbarCallOptions v-if="callActive" :call="callActive" />

    <div class="call-status">
        <span v-if="callActive" class="timer">{{ sessionTime }}</span>
        <span class="text">{{ callStatus }}</span>

        <div class="signalling-protocol">
            <icon
                class="protocol-status tooltip tooltip-left" :class="classes"
                :data-tooltip="tooltip"
                name="signalling"
            />
            <span>
                {{ description.protocol }}
            </span>
        </div>
    </div>
</component>
