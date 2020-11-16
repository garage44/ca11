<component class="c-sidebar panel">
    <div class="actions">
        <SidebarCallSwitch />
        <SidebarDnd />
    </div>

    <div class="tabs">
        <button
            class="btn btn-menu t-btn-menu-activity tooltip tooltip-right"
            :class="classes('activities')"
            :data-tooltip="$t('activity')"
            @click="setLayer('activities')"
        >
            <icon name="activities" />
        </button>

        <button
            class="btn btn-menu t-btn-menu-contacts tooltip tooltip-right"
            :class="classes('contacts', true)"
            :data-tooltip="$t('contacts')"
            @click="setLayer('contacts')"
        >
            <icon name="contacts" />
        </button>

        <button
            class="btn btn-menu t-btn-menu-settings tooltip tooltip-right"
            :class="{active: layer === 'settings'}"
            :data-tooltip="$t('settings')"
            @click="setLayer('settings')"
        >
            <icon name="settings" />
        </button>

        <button
            class="btn btn-menu btn-logout tooltip tooltip-right"
            :data-tooltip="$t('logout')"
            @click="logout"
        >
            <icon name="logout" />
        </button>
    </div>
</component>
