<component :class="{[`grid-${streams.length}`]: true}" class="c-stream-view grid">
    <div
        :class="`stre-${index + 1}`"
        :key="stream.id"
        class="stream-container"
        v-for="(stream, index) in streams"
    >
        <StreamControls :stream="stream" />
        <Stream :stream="stream" />
    </div>
</component>
