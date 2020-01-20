<component class="c-protocol-status">
    <FieldRadio class="protocol-status tooltip tooltip-right"
        :class="classes"
        v-model="description.protocol"
        elementclass="t-rd-calls-protocol"
        name="protocol"
        :options="protocols"
        :data-tooltip="tooltip"
    />
</component>