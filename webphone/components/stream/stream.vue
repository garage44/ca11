<component
    :class="classes()"
    @click="$emit('click', $event)"
    class="c-stream"
>
    <transition name="fade">
        <icon
            class="spinner stream-icon"
            name="spinner"
            v-if="stream.local && !stream.ready"
        />
        <icon
            v-else-if="showType"
            class="stream-icon"
            :name="stream.kind"
        />
    </transition>

    <div class="audio" :class="{visible: (stream.id && stream.kind === 'audio')}">
        <audio
            :id="`audio-${stream.id}`"
            ref="audio"
            autoplay="true"
            muted="true"
        />
    </div>

    <video
        :id="`video-${stream.id}`"
        ref="video"
        autoplay="true"
        :class="{visible: (stream.id && stream.kind === 'video')}"
        :muted="stream.muted"
    />

    <video
        :id="`display-${stream.id}`"
        ref="display"
        autoplay="true"
        :class="{visible: (stream.id && stream.kind === 'display')}"
        :muted="stream.muted"
    />
</component>
