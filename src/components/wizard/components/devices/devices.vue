<component class="c-wizard-devices t-devices">
    <header class="c-wizard__header">
        {{$t('devices')}}
    </header>

    <Devices/>

    <slot name="progress"></slot>

    <div class="buttons stretched">
        <button
            class="button button--widget t-btn-devices-back"
            @click="stepBack()"
        >{{$t('back')}}</button>

        <button
            class="button button--widget primary t-btn-devices-next"
            @click="storeDevices()"
            :disabled="!stepValid"
        >{{$t('next')}}</button>
    </div>
</component>
