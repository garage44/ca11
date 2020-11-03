<component class="c-dnd">
    <icon :data-tooltip="$t('do not disturb')" class="dnd-toggle extended tooltip tooltip-left" name="dnd_availability" />
    <button
        class="btn btn-menu tooltip tooltip-left hint"
        :data-tooltip="$t('accept call')"
        @click="toggleDnd"
    >
        <icon :name="dnd ? 'do-not-disturb' : 'do-not-disturb-off'" />
    </button>
</component>