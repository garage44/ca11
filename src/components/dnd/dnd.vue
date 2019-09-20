<component class="c-dnd">
            <FieldRadio
                v-model="description.protocol"
                elementclass="t-rd-calls-protocol"
                class="header__filter"
                name="protocol"
                :options="protocols"
            />
    <FieldCheckbox
        v-model="dnd"
        class="tooltip tooltip-bottom"
        :data-tooltip="$t('do not disturb')"
        name="dnd_availability"
    />
</component>
