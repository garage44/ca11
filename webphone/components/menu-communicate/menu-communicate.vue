<component class="c-menu-communicate">
    <button
        :data-tooltip="$t('logout')"
        @click="logout"
        class="btn  btn-menu btn-logout tooltip tooltip-left"
    >
        <icon name="logout" />
    </button>
    <Dnd />
    <ProtocolStatus />

    <MenuCommunicateSwitcher />
</component>
