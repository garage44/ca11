<component
    :class="classes()"
    @click="$emit('click', $event)"
    class="c-stream"
>
    <transition name="fade">
        <icon
            class="spinner stream-icon"
            name="spinner"
            v-if="!stream.ready"
        />
        <icon
            v-else-if="showType"
            class="stream-icon"
            :name="stream.kind"
        />
    </transition>

    <div class="audio" :class="{visible: (stream.id && stream.kind === 'audio')}">
        <audio
            ref="audio"
            autoplay="true"
            muted="true"
        />
    </div>

    <video
        ref="video"
        autoplay="true"
        :class="{visible: (stream.id && stream.kind === 'video')}"
        :muted="stream.muted"
    />

    <video
        ref="display"
        autoplay="true"
        :class="{visible: (stream.id && stream.kind === 'display')}"
        :muted="stream.muted"
    />
</component>
