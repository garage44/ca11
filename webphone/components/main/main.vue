<component :class="classes('component')" class="c-main t-main">
    <Notifications />
    <transition appear mode="out-in" name="tr-caller-bar">
        <MenuCall v-if="callsExist || layer === 'dialer'" class="c-main__status" />
    </transition>

    <Session v-if="!session.authenticated" />

    <!-- these menus are always in sight -->
    <MenuContext v-if="session.authenticated" />
    <MenuCommunicate v-if="session.authenticated" :call="callActive" />
    <AudioBg />

    <layer :is="layer" v-if="session.authenticated" class="layer" />
</component>
