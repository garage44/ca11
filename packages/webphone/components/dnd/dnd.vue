<component class="c-dnd">
    <FieldCheckbox
        :data-tooltip="$t('do not disturb')"
        class="dnd-toggle extended tooltip tooltip-right"
        component-class
        name="dnd_availability"
        v-model="dnd"
    >
        <template v-slot:icon-disabled>
            <icon class="icon-disabled" name="do-not-disturb-off" />
        </template>
        <template v-slot:icon-enabled>
            <icon class="icon-enabled" name="do-not-disturb" />
        </template>
    </FieldCheckbox>
</component>