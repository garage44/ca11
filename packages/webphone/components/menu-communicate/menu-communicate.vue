<component class="c-menu-communicate">
    <button
        :class="classes('activities')"
        :data-tooltip="$t('activity')"
        @click="setLayer('activities')"
        class="btn  btn-menu t-btn-menu-activity tooltip tooltip-left"
    >
        <icon name="activities" />
    </button>

    <button
        class="btn  btn-menu t-btn-menu-contacts tooltip tooltip-left"
        :class="classes('contacts', true)"
        :data-tooltip="$t('contacts')"
        @click="setLayer('contacts')"
    >
        <icon name="contacts" />
    </button>

    <CallerSwitcher />
</component>
