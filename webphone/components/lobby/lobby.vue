<component :class="classes('component')" class="c-lobby module">
    <div class="panel root">
        <StreamControls :stream="stream[stream.type]" />
    </div>

    <div class="content">
        <Stream :stream="stream[stream.type]" />
    </div>
</component>
