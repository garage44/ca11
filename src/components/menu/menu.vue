<nav component class="c-menu">
    <div class="options">

        <button
            class="button button--menu c-status-menu__button t-btn-settings tooltip tooltip-bottom"
            :class="{active: layer === 'settings'}"
            :data-tooltip="$t('settings')"
            @click="setLayer('settings')"
        ><icon name="settings"/></button>

        <button
            class="button button--menu c-menu__option t-btn-menu-activity tooltip tooltip-right"
            :class="classes('activities')"
            :data-tooltip="$t('activity')"
            @click="setLayer('activities')"
        ><icon name="activities"/></button>

        <button
            class="button button--menu c-menu__option t-btn-menu-contacts tooltip tooltip-right"
            :class="classes('contacts', true)"
            :data-tooltip="$t('contacts')"
            @click="setLayer('contacts')"
        ><icon name="contacts"/></button>

        <button
            class="button button--menu c-menu__option t-btn-menu-caller tooltip tooltip-right"
            :class="classes('caller')"
            :data-tooltip="$t('calling')"
            @click="setLayer('caller')"
        ><icon name="caller"/></button>

        <button
            v-if="plugin.menubarIcon"
            v-for="plugin in customPlugins" @click="setLayer(plugin.menubarIcon)"
            class="button option"
            :class="classes(plugin.menubarIcon)"
        ><icon :name="plugin.menubarIcon"/></button>

    </div>
</nav>
