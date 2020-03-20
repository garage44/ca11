<component class="c-devices t-devices">
    <DevicesPermission v-if="!media.permission" />
    <DevicesConfig v-else :stream="media.stream[media.stream.type]" />
</component>
