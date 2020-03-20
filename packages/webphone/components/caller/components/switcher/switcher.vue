<component class="c-call-switcher">
    <div class="container">
        <button
            :class="classes(call)"
            :data-tooltip="callTitle(call)"
            @click="activateCall(call)"
            class="btn btn-menu call tooltip tooltip-left"
            v-for="call in calls"
        >
            <icon :name="callIcon(call)" />
        </button>

        <button
            class="btn btn-menu call t-btn-switcher-call-new placeholder tooltip tooltip-left"
            :class="{
                active: !stream[stream.type].selected && !callActive.id && ui.layer === 'caller',
                hint: 'true'
            }"
            :data-tooltip="$t('add new call')"
            @click="activateCall()"
        >
            <icon name="phone-add" />
        </button>
    </div>
</component>
