<component class="c-ts-controls">

    <button class="button button--menu c-menu__option t-btn-menu-activity tooltip tooltip-left"
        :class="classes('activities')"
        :data-tooltip="$t('activity')"
        @click="setLayer('activities')">
        <icon name="activities"/>
    </button>

    <button class="button button--menu c-menu__option t-btn-menu-contacts tooltip tooltip-left"
        :class="classes('contacts', true)"
        :data-tooltip="$t('contacts')"
        @click="setLayer('contacts')">
        <icon name="contacts"/>
    </button>

    <CallerSwitcher />
</component>
