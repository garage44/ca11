<section component class="c-settings t-settings content-wide">

    <header class="content__header header">

        <ul class="header__tabs">
            <li
                class="button button--menu tooltip tooltip-bottom"
                :class="classes('tabs', 'general')"
                :data-tooltip="$t('general')"
                @click="setTab('settings', 'general')"
            >
                <icon name="settings-misc"/>
            </li>
            <li
                class="button button--menu tooltip tooltip-bottom"
                :class="classes('tabs', 'devices')"
                :data-tooltip="$t('devices')"
                @click="setTab('settings', 'devices', settings.webrtc.enabled)"
            >
                <icon name="headset_mic"/>
            </li>
            <li
                class="button button--menu tooltip tooltip-bottom"
                :class="classes('tabs', 'sig11')"
                data-tooltip="SIG11"
                @click="setTab('settings', 'sig11')"
            >
                <icon name="protocol-sig11"/>
            </li>
            <li
                class="button button--menu tooltip tooltip-bottom t-tab-sip"
                :class="classes('tabs', 'sip')"
                data-tooltip="SIP"
                @click="setTab('settings', 'sip')"
            >
                <icon name="protocol-sip"/>
            </li>
            <li
                class="button button--menu tooltip tooltip-bottom"
                :class="classes('tabs', 'webhooks')"
                data-tooltip="Webhooks"
                @click="setTab('settings', 'webhooks')"
            >
                <icon name="webhooks"/>
            </li>
        </ul>
    </header>

    <main class="main">
        <!-- General settings -->
        <div class="tab" :class="{active: tabs.active === 'general'}">
            <FieldSelect
                v-model="language.selected"
                name="language"
                :help="$t('language used throughout the application.')"
                :label="$t('application language')"
                :options="language.options"
            />

            <FieldSelect
                v-model="settings.ringtones.selected"
                name="ringtone"
                :label="$t('ringtone')"
                :options="settings.ringtones.options">

                <button
                    slot="button"
                    class="button"
                    :disabled="playing.ringOutput"
                    @click="playSound('ringTone', 'ringOutput')"
                >
                    <icon name="call-active"/>
                </button>
            </FieldSelect>

            <FieldCheckbox
                v-model="app.vault.store"
                name="store_key"
                :help="$t('automatically unlock your session after restart.')"
                :label="$t('remember session')"
            />
        </div>


        <!-- Device settings -->
        <div class="tab" :class="{active: tabs.active === 'devices'}">
            <Devices :stream="media.stream[media.stream.type]"/>
        </div>


        <!-- SIG11 preferences -->
        <div class="tab" :class="{active: tabs.active === 'sig11'}">
            <FieldCheckbox
                v-model="sig11.toggled"
                name="sig11_enabled"
                :help="$t('free, privacy-friendly calling on SIG11 network.')"
                :label="`SIG11 ${$t('network')} (${$t('decentralized')})`"
            />

            <FieldText
                v-if="sig11.toggled"
                v-model="sig11.endpoint"
                name="sig11_endpoint"
                placeholder="e.g. sig11.websocket.tld"
                help="SIG11 WebSocket Service"
                :label="`SIG11 ${$t('domain')}`"
                :validation="$v.sig11.endpoint"
            />

            <FieldText
                v-if="sig11.toggled"
                v-model="sig11.identity.name"
                name="sig11_name"
                :help="$t('your display name to others.')"
                :label="$t('display name')"
            />

            <FieldText
                v-if="sig11.toggled"
                v-model="sig11.identity.number"
                name="sig11_number"
                :help="$t('the number that people can reach you on.')"
                :label="`SIG11 ${$t('number')}`"
            />
        </div>


        <!-- SIP preferences -->
        <div class="tab" :class="{active: tabs.active === 'sip'}">
            <FieldCheckbox
                v-model="sip.toggled"
                elementclass="t-cb-sip-toggled"
                name="sip_enabled"
                :help="$t('calling on the network of a SIP provider.')"
                :label="`SIP ${$t('network')} (${$t('centralized')})`"
            />

            <div class="sip-disclaimer" v-if="!sip.toggled">
                <b>{{$t('disclaimer').toUpperCase()}}:</b><br/>
                {{$t('{name} supports connecting to SIP networks, but {vendor} is not a SIP provider.', {name: app.name, vendor: app.vendor.name}).ca()}}
                {{$t('in no event will {vendor} be liable for any loss, damage or fraud that may result from using {name} for SIP calling.', {name: app.name, vendor: app.vendor.name}).ca()}}
            </div>

            <FieldText
                v-if="sip.toggled"
                v-model="sip.endpoint"
                elementclass="t-txt-sip-endpoint"
                name="sip_endpoint"
                placeholder="e.g. sip.websocket.tld"
                :label="`SIP-WSS ${$t('domain')}`"
                help="SIP WebSocket Service"
                :validation="$v.sip.endpoint"
            />

            <FieldText
                v-if="sip.toggled"
                v-model="sip.account.username"
                elementclass="t-txt-sip-username"
                name="sip_username"
                :label="`SIP ${$t('extension')}`"
                placeholder="1000"
                :validation="$v.sip.account.username"
            />

            <FieldPassword
                v-if="sip.toggled"
                v-model="sip.account.password"
                elementclass="t-txt-sip-password"
                name="sip_password"
                :label="`SIP ${$t('password')}`"
                :placeholder="`SIP ${$t('password')}`"
                :validation="$v.sip.account.password"
            />
        </div>

        <!-- Device settings -->
        <div class="tab" :class="{active: tabs.active === 'webhooks'}">

            <FieldCheckbox
                v-model="webhooks.enabled"
                elementclass="t-cb-webhooks-toggled"
                name="webhooks_enabled"
                :help="$t('opens a third-party information provider in a new tab.')"
                :label="$t('webhooks')"
            />

            <FieldText
                v-if="sip.toggled"
                v-model="webhooks.url"
                elementclass="t-txt-sip-endpoint"
                name="sip_endpoint"
                placeholder="e.g. sip.websocket.tld"
                :label="`webhook url`"
                :help="$t('the url to open when a call comes in.')"
                :validation="$v.sip.endpoint"
            />
        </div>


        <div class="tabs-actions">
            <button
                class="button button--widget primary t-btn-settings-save"
                :disabled="$v.$invalid"
                @click="save"
            >{{$t('save settings')}}</button>
        </div>
    </main>


</section>
