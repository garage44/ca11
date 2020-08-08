<component class="c-menu-context">
    <div class="options">
        <button
            :class="{active: layer === 'settings'}"
            :data-tooltip="$t('settings')"
            @click="setLayer('settings')"
            class="btn btn-menu c-status-menu__button t-btn-settings tooltip tooltip-bottom"
        >
            <icon name="settings" />
        </button>

        <button
            class="btn  btn-menu t-btn-menu-activity tooltip tooltip-left"
            :class="classes('activities')"
            :data-tooltip="$t('activity')"
            @click="setLayer('activities')"
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
    </div>
</component>
