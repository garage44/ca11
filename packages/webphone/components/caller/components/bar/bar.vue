<component class="c-caller-bar">

    <div class="call-direction">
        <icon v-if="call" :name="`call-${call.direction}`"/>
        <icon v-else name="call-outgoing"/>
    </div>

    <div class="call-endpoint">
        <span v-if="call">
            <span v-if="call.name" class="c-status-call__number">{{call.name}} - </span>
            <span class="c-status-call__number">
                {{call.number}}
            </span>
        </span>
        <span v-else>
            <span class="c-status-call__number">
                {{description.number}}
            </span>
        </span>
    </div>

    <CallOptions :call="callActive"/>

    <div v-if="call" class="call-status">
        <span>{{callStatus}}</span>
        <icon name="nodes" v-if="call.protocol === 'sig11'"/>
        <icon name="cloud" v-else-if="call.protocol === 'sip'"/>
        <span class="timer">{{sessionTime}}</span>
    </div>
    <div v-else class="call-status">
        <span>{{$t('new call')}}</span>
        <icon name="nodes" v-if="description.protocol === 'sig11'"/>
        <icon name="cloud" v-else-if="description.protocol === 'sip'"/>
    </div>
</component>
