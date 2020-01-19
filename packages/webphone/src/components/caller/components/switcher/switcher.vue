<component class="c-call-switcher">
    <div class="container">
        <button v-for="call in calls"
            class="button button--menu call tooltip tooltip-left"
            :class="classes(call)"
            :data-tooltip="callTitle(call)"
            @click="activateCall(call)">
            <icon :name="callIcon(call)"/>
        </button>

        <button
            class="button button--menu call t-btn-switcher-call-new placeholder tooltip tooltip-left"
            :class="{
                active: !stream[stream.type].selected && !callActive.id && ui.layer === 'caller',
                hint: 'true'
            }"
            :data-tooltip="$t('add new call')"
            @click="activateCall()">
            <icon name="phone-add"/>
        </button>
    </div>
</component>
