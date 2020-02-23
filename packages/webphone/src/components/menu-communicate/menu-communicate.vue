<component class="c-menu-communicate">

    <button class="button button--menu t-btn-menu-activity tooltip tooltip-left"
        :class="classes('activities')"
        :data-tooltip="$t('activity')"
        @click="setLayer('activities')">
        <icon name="activities"/>
    </button>

    <button class="button button--menu t-btn-menu-contacts tooltip tooltip-left"
        :class="classes('contacts', true)"
        :data-tooltip="$t('contacts')"
        @click="setLayer('contacts')">
        <icon name="contacts"/>
    </button>

    <CallerSwitcher />
</component>
