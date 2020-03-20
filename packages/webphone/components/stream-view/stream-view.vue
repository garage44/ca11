<component
    :class="classes('component')" class="c-stream-view"
>
    <div
        :class="`slot-${index + 1}`" :key="slot.id"
        class="slot"
        v-for="(slot, index) in slots"
    >
        <div class="c-stream placeholder" v-if="slot.type === 'placeholder'">
            <icon class="c-stream__icon" name="caller" />
            <div class="content">
                <div class="c-stream__slot">
                    {{ index + 1 }}
                </div>
            </div>
        </div>
        <Stream v-else :stream="slot" />
    </div>
</component>
