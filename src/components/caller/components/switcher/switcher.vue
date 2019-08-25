<component class="c-call-switcher">
    <div class="container">

        <button
            v-if="!stream[stream.type].ready"
            class="button call tooltip tooltip-left c-media-type"
            @click="activateMedia"
            :class="{selected: stream[stream.type].selected}"
            :data-tooltip="callTitle()"
        >
            <icon :name="stream.type"/>
        </button>
        <Stream
            v-else
            :controls="false"
            :stream="stream[stream.type]"
            class="local"
            @click="activateMedia"
        />

        <button v-for="call in calls"
            class="button call tooltip tooltip-left"
            :class="classes(call)"
            :data-tooltip="callTitle(call)"
            @click="activateCall(call)"
        >
            <icon :name="callIcon(call)"/>
        </button>

        <button
            class="button call t-btn-switcher-call-new placeholder tooltip tooltip-left"
            :class="{active: !stream[stream.type].selected && !callActive.id && ui.layer === 'caller', hint: 'true'}"
            :data-tooltip="$t('add new call')"
            @click="activateCall()"
        >
            <icon name="phone-add"/>
        </button>


    </div>
</component>
