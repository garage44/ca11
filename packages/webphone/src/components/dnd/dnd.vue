<component class="c-dnd">
    <FieldCheckbox class="dnd-toggle extended tooltip tooltip-right"
        v-model="dnd"
        componentClass
        :data-tooltip="$t('do not disturb')"
        name="dnd_availability">
        <template v-slot:icon-disabled>
            <icon class="icon-disabled" name="do-not-disturb-off"/>
        </template>
        <template v-slot:icon-enabled>
            <icon class="icon-enabled" name="do-not-disturb"/>
        </template>
    </FieldCheckbox>
</component>