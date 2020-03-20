<component class="c-menu-context">
    <div class="options">
        <Dnd />
        <ProtocolStatus />

        <button
            class="btn  btn-menu c-status-menu__button t-btn-settings tooltip tooltip-bottom"
            :class="{active: layer === 'settings'}"
            :data-tooltip="$t('settings')"
            @click="setLayer('settings')"
        >
            <icon name="settings" />
        </button>

        <button
            class="btn  btn-menu button-quit tooltip tooltip-right"
            :data-tooltip="$t('logout')"
            @click="logout"
        >
            <icon name="logout" />
        </button>
    </div>
</component>
