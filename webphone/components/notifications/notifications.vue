<component
    :class="{'t-res-notifications': notifications.length, 't-nores-notifications': !notifications.length}"
    class="c-notifications"
>
    <transition-group name="notification" tag="ul">
        <li
            :class="classes('notification', item)"
            class="notification"
            v-bind:key="notifications.indexOf(item)"
            v-for="item in notifications"
        >
            <div class="icon">
                <icon :name="item.icon" v-if="item.icon" />
            </div>
            <div class="message cf">
                {{ item.message }}
                <span v-if="item.link" class="cf link" @click="openUrl(item.link.url)">{{ item.link.text }}</span>
            </div>
        </li>
    </transition-group>
</component>
