<component class="c-audio-bg" v-if="call">
    <Stream
        :controls="false"
        :stream="stream"
        v-for="stream of Object.values(call.streams)"
    />
</component>
