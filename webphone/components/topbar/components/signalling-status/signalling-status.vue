<component class="c-protocol-status">
    <span class="timer" v-if="callActive">{{ sessionTime }}</span>
    <span class="text">{{ signalStatus }}</span>

    <div class="signalling-protocol">
        <icon
            :class="classes" :data-tooltip="tooltip"
            class="protocol-status tooltip tooltip-left"
            name="signalling"
        />
        <span>
            {{ description.protocol }}
        </span>
    </div>
</component>