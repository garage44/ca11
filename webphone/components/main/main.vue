<component :class="classes('component')" class="c-main t-main">
    <Notifications />
    <transition appear mode="out-in" name="tr-caller-bar">
        <MenuCall v-if="callsExist || layer === 'dialer'" class="c-main__status" />
    </transition>

    <Session v-if="!session.authenticated" />

    <!-- these menus are always visible -->
    <MenuContext v-if="session.authenticated" />
    <MenuCommunicate v-if="session.authenticated" :call="callActive" />
    <AudioBg />
    <button
        class="btn btn-menu btn-logout tooltip tooltip-left"
        :data-tooltip="$t('logout')"
        @click="logout"
    >
        <icon name="logout" />
    </button>
    <layer :is="layer" v-if="session.authenticated" class="layer" />
</component>
