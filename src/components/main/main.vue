<component class="c-main t-main" :class="classes('component')">
    <!-- Force the telemetry window to show up -->
    <Notifications :class="classes('notifications')"/>

    <Status v-if="(session.authenticated && wizard.completed)" class="c-main__status"/>

    <Session v-if="!session.authenticated"/>
    <Wizard v-else-if="!wizard.completed && session.authenticated"/>

    <Menu v-if="wizard.completed && session.authenticated" class="c-main__menu"/>

    <!-- Dynamic component from layer name -->
    <AudioBg/>
    <Main v-if="wizard.completed && session.authenticated" :is="layer" class="c-main__content"/>
    <MediaControls v-if="wizard.completed && session.authenticated" :call="callActive"/>
</component>
