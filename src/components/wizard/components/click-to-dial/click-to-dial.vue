<component class="c-click-to-dial t-click-to-dial">
    <header class="c-wizard__header">{{$t('click-to-dial')}}</header>

    <div class="c-wizard__description">
        {{$t('phone number links on websites can be associated with the {name} phone.', {name: app.name}).ca()}}
        {{$t('do you want {name} to be opened and the number filled automatically when clicking on telephony links?', {name: app.name}).ca()}}<br/>

        <div class="cf c-wizard__help">
            <button
                class="button button--widget is-primary"
                @click="triggerProtocolHandler()"
            >{{$t('ask permission')}}</button>
        </div>
    </div>

    <slot name="progress"></slot>

    <div class="buttons is-centered stretched" v-if="selected.ready !== null">
        <button
            class="button button--widget t-btn-click-to-dial-back is-left"
            @click="stepBack()"
        >{{$t('back')}}</button>
        <button
            class="button button--widget primary t-btn-click-to-dial-next"
            @click="stepNext()"
        >{{$t('next')}}</button>
    </div>
</component>
