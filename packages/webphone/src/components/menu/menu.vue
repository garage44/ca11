<nav component class="c-menu">
    <div class="options">

        <button class="button button--menu c-status-menu__button t-btn-settings tooltip tooltip-bottom"
            :class="{active: layer === 'settings'}"
            :data-tooltip="$t('settings')"
            @click="setLayer('settings')">
            <icon name="settings"/>
        </button>


        <ProtocolStatus/>
        <Dnd/>

        <button class="button button--menu button-quit tooltip tooltip-right"
            @click="logout"
            :data-tooltip="$t('logout')">
            <icon name="logout"/>
        </button>

    </div>
</nav>
