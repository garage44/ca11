<component class="c-main t-main" :class="classes('component')">
    <!-- Force the telemetry window to show up -->
    <Notifications :class="classes('notifications')"/>

    <transition name="c-status__context-switch" mode="out-in" appear>
        <CallerBar v-if="session.authenticated" class="c-main__status"/>
    </transition>

    <Session v-if="!session.authenticated"/>

    <Menu v-if="session.authenticated" class="c-main__menu"/>

    <AudioBg/>

    <div class="layer">
        <layer v-if="session.authenticated" :is="layer" />
    </div>
    <TsControls v-if="session.authenticated" :call="callActive" class="c-main__media-controls"/>
</component>
