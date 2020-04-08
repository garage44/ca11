<component class="c-protocol-status">
    <FieldRadio
        :class="classes"
        :data-tooltip="tooltip"
        :options="protocols"
        class="protocol-status tooltip tooltip-left"
        elementclass="t-rd-calls-protocol"
        name="protocol"
        v-model="description.protocol"
    />
</component>