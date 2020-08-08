<component class="c-caller-bar">
    <div class="call-direction">
        <icon :name="`call-${call.direction}`" v-if="call" />
        <icon v-else name="call-outgoing" />
    </div>

    <div class="call-endpoint">
        <span v-if="call">
            <span v-if="call.name" class="c-status-call__number">{{ call.name }} - </span>
            <span class="c-status-call__number">
                {{ call.number }}
            </span>
        </span>
        <span v-else>
            <span v-if="description.endpoint" class="c-status-call__number">
                {{ description.endpoint }}
            </span>
            <span v-else class="c-status-call__number">
                {{ `${$t('number to call')}...` }}
            </span>
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
