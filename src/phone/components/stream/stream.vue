
<component
    class="c-stream"
    :class="classes()"
    @click="$emit('click', $event)"
>
    <icon v-if="stream.ready" class="c-stream__icon" :name="stream.kind"/>
    <icon v-else name="spinner" class="spinner c-stream__icon" />

    <audio
        v-show="stream.id && stream.kind === 'audio'"
        autoplay="true"
        muted="true"
        ref="audio"
    />

    <video
        v-show="stream.id && stream.kind === 'video'"
        autoplay="true"
        :muted="stream.muted"
        ref="video"
    />

    <video
        v-show="stream.id && stream.kind === 'display'"
        autoplay="true"
        :muted="stream.muted"
        ref="display"
    />

    <div v-if="stream.ready && controls" class="c-stream__controls">
        <icon name="fullscreen" @click.stop="toggleFullscreen()"/>
        <icon name="pip" :class="{active: recording}" @click.stop="togglePip()"/>
        <icon name="record-rec" :class="{active: recording}" @click.stop="toggleRecord()"/>
        <icon v-if="stream.local" :name="stream.kind" @click.stop="switchStream()"/>
    </div>
</component>
