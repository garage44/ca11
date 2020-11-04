<component class="c-protocol-status">
    <div class="protocol">
        <icon
            :class="classes" :data-tooltip="tooltip"
            class="protocol-status tooltip tooltip-left"
            name="signalling-protocol"
        />
        {{ description.protocol }}
    </div>
</component>