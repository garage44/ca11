<component class="c-sig11 t-sig11">
    <header class="c-wizard__header">{{$t('your caller id')}}</header>

    <div class="c-wizard__description">
        {{$t('{name} introduces easy, secure and free P2P Web Telephony that protects your privacy.', {name: app.name}).ca()}}
        {{$t('unlike traditional telephony, you can also choose your own number, or even a name, on which callers may reach you.').ca()}}
        <br/><br/>
    </div>

    <FieldText
        v-model="sig11.identity.number"
        elementclass="t-txt-sig11-number"
        name="sig11_number"
        :help="$t('number or name that you want to be reachable on.')"
        :label="$t('caller identity')"
        :validation="$v.sig11.identity.number"
    />

    <FieldText
        v-model="sig11.identity.name"
        elementclass="t-txt-sig11-name"
        name="sig11_name"
        :help="$t('name that identifies you during calls.')"
        :label="$t('caller description')"
        :validation="$v.sig11.identity.name"
    />

    <slot name="progress"></slot>

    <div class="buttons is-centered stretched" v-if="selected.ready !== null">
        <button
            class="button button--widget t-btn-sig11-cancel"
            @click="stepBackFirst()"
        >
            {{$t('cancel')}}
        </button>
        <button
            class="button button--widget primary t-btn-sig11-next"
            :disabled="$v.$invalid"
            @click="updateIdentity()"
        >{{$t('next')}}</button>
    </div>
</component>
