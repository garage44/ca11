<component class="c-audio-bg" v-if="call">
    <Stream
        v-for="stream of Object.values(call.streams)"
        :controls="false"
        :stream="stream"
    />
</component>
