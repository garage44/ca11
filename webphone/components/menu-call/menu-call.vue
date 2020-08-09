<component class="c-caller-bar">
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
        <span v-else>
            <input
                v-model="description.endpoint"
                autocomplete="off"
                class="phone-id"
                name="number-input"
                :placeholder="`${$t('enter call id')}...`"
                type="text"
            >
        </span>
    </div>

    <MenuCallOptions :call="callActive" />
    <div v-if="callActive" class="call-status">
        <span>{{ callStatus }}</span>
        <icon v-if="call.protocol === 'sig11'" name="nodes" />
        <icon v-else-if="call.protocol === 'sip'" name="cloud" />
        <span class="timer">{{ sessionTime }}</span>
    </div>
    <div v-else class="call-status">
        <span>{{ $t('new call') }}</span>
        <icon v-if="description.protocol === 'sig11'" name="nodes" />
        <icon v-else-if="description.protocol === 'sip'" name="cloud" />
    </div>
</component>
