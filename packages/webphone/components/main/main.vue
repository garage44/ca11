<component class="c-main t-main" :class="classes('component')">

    <Notifications/>
    <transition name="tr-caller-bar" mode="out-in" appear>
        <CallerBar v-if="callsExist" class="c-main__status"/>
    </transition>

    <Session v-if="!session.authenticated"/>
    <MenuContext v-if="session.authenticated"/>

    <MenuCommunicate v-if="session.authenticated" :call="callActive"/>

    <AudioBg/>

    <div class="layer">
        <layer v-if="session.authenticated" :is="layer" />
    </div>
</component>
