
<component
    :class="classes()"
    @click="$emit('click', $event)"
    class="c-stream-controls actions"
>
    <button
        :class="{active: recording}"
        :data-tooltip="$t('switch media')"
        @click.stop="switchStream()"
        class="action button btn-menu tooltip tooltip-right"
        v-if="stream.local"
    >
        <icon :name="stream.kind" />
    </button>

    <button
        v-if="stream.kind !== 'audio'"
        class="action button btn-menu tooltip tooltip-right"
        :class="{'active': editMode}"
        :data-tooltip="$t('fullscreen')"
        @click.stop="toggleFullscreen()"
    >
        <icon name="fullscreen" />
    </button>

    <button
        v-if="stream.kind !== 'audio'"
        class="action button btn-menu tooltip tooltip-right"
        :class="{active: recording}"
        :data-tooltip="$t('Picture-in-Picture')"
        @click.stop="togglePip()"
    >
        <icon name="pip" />
    </button>


    <button
        class="action button btn-menu tooltip tooltip-right"
        :class="{active: recording}"
        :data-tooltip="$t('record stream')"
        @click.stop="toggleRecord()"
    >
        <icon name="record-rec" />
    </button>
</component>
