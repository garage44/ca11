<component class="c-status-call">

    <div class="c-status-call__direction">
        <icon v-if="call" :name="`call-${call.direction}`"/>
        <icon v-else name="call-outgoing"/>
    </div>

    <div class="c-status-call__endpoint">
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

    <div v-if="call" class="c-status-call__status">
        <span>{{callStatus}}</span>
        <icon name="nodes" v-if="call.protocol === 'sig11'"/>
        <icon name="cloud" v-else-if="call.protocol === 'sip'"/>
        <span class="c-status-call__status-timer">{{sessionTime}}</span>
    </div>
    <div v-else class="c-status-call__status">
        <span>{{$t('new call')}}</span>
        <icon name="nodes" v-if="description.protocol === 'sig11'"/>
        <icon name="cloud" v-else-if="description.protocol === 'sip'"/>
    </div>

</component>
