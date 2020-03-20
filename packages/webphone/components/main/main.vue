<component :class="classes('component')" class="c-main t-main">
    <Notifications />
    <transition appear mode="out-in" name="tr-caller-bar">
        <CallerBar v-if="callsExist" class="c-main__status" />
    </transition>

    <Session v-if="!session.authenticated" />
    <MenuContext v-if="session.authenticated" />

    <MenuCommunicate v-if="session.authenticated" :call="callActive" />

    <AudioBg />

    <div class="layer">
        <layer :is="layer" v-if="session.authenticated" />
    </div>
</component>
