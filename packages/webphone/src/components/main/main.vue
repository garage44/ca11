<component class="c-main t-main" :class="classes('component')">
    <!-- Force the telemetry window to show up -->
    <Notifications :class="classes('notifications')"/>
    <transition name="tr-caller-bar" mode="out-in" appear>
        <CallerBar v-if="callsExist" class="c-main__status"/>
    </transition>

    <Session v-if="!session.authenticated"/>
    <MenuContext v-if="session.authenticated" class="c-main__menu"/>
    <MenuCommunicate v-if="session.authenticated" :call="callActive" class="c-main__media-controls"/>

    <AudioBg/>

    <div class="layer">
        <layer v-if="session.authenticated" :is="layer" />
    </div>
</component>
