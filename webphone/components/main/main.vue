<component :class="classes('component')" class="c-main t-main">
    <Notifications />
    <transition appear mode="out-in" name="tr-caller-bar">
        <Topbar v-if="callsExist || layer === 'dialer'" class="c-main__status" />
    </transition>

    <Session v-if="!session.authenticated" />

    <!-- these menus are always visible -->
    <Sidebar v-if="session.authenticated" />
    <AudioBg />
    <layer :is="layer" v-if="session.authenticated" class="layer" />
</component>
