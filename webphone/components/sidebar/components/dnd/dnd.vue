<component class="c-dnd">
    <button
        :data-tooltip="$t('do not disturb')"
        @click="toggleDnd"
        class="btn btn-menu tooltip tooltip-right hint"
    >
        <icon :name="dnd ? 'do-not-disturb' : 'do-not-disturb-off'" />
    </button>
</component>