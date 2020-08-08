<component :class="classes('component')" class="c-dialer t-dialer module">
    <panel>
        <StreamControls :stream="stream[stream.type]" />
    </panel>

    <content>
        <DialerEndpoint />
        <Stream :stream="stream[stream.type]" />
    </content>
</component>
