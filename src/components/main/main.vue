<component class="c-main t-main" :class="classes('component')">
    <!-- Force the telemetry window to show up -->
    <Notifications :class="classes('notifications')"/>


    <button
        class="button button--menu button-quit tooltip tooltip-left"
        @click="logout"
        :data-tooltip="$t('quit')"
    >
        <icon name="logout"/>
    </button>

    <transition name="c-status__context-switch" mode="out-in" appear>
        <CallerBar v-if="(session.authenticated && wizard.completed)" class="c-main__status"/>
    </transition>

    <Session v-if="!session.authenticated"/>
    <Wizard v-else-if="!wizard.completed && session.authenticated"/>

    <Menu v-if="wizard.completed && session.authenticated" class="c-main__menu"/>

    <!-- Dynamic component from layer name -->
    <AudioBg/>
    <Main v-if="wizard.completed && session.authenticated" :is="layer" class="c-main__content"/>
    <TsControls v-if="wizard.completed && session.authenticated" :call="callActive" class="c-main__media-controls"/>
</component>
