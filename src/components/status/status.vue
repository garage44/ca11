<component class="c-status">
    <transition name="c-status__context-switch" mode="out-in" appear>
        <StatusCall
            v-if="callsExist"
            key="call"
            class="c-status__context"
            :call="callActive"
        />
        <StatusMenu
            v-else
            class="c-status__context"
            key="menu"
        />
    </transition>
</component>
