<component class="c-settings module t-settings">
    <panel>
        <div class="actions">
            <button
                :data-tooltip="$t('save settings')"
                :disabled="$v.$invalid"
                @click.stop="save"
                class="btn btn-menu action tooltip tooltip-bottom"
            >
                <icon name="database" />
            </button>
        </div>
        <ul class="tabs">
            <li
                class="btn btn-menu tab tooltip tooltip-bottom"
                :class="classes('tabs', 'general')"
                :data-tooltip="$t('general')"
                @click="setTab('settings', 'general')"
            >
                <icon name="settings-misc" />
            </li>
            <li
                class="btn btn-menu tab tooltip tooltip-bottom"
                :class="classes('tabs', 'devices')"
                :data-tooltip="$t('devices')"
                @click="setTab('settings', 'devices', settings.webrtc.enabled)"
            >
                <icon name="headset_mic" />
            </li>
            <li
                class="btn btn-menu tab tooltip tooltip-bottom t-tab-sip"
                :class="classes('tabs', 'sip')"
                data-tooltip="SIP"
                @click="setTab('settings', 'sip')"
            >
                <icon name="protocol-sip" />
            </li>
            <li
                class="btn btn-menu tab tooltip tooltip-bottom"
                :class="classes('tabs', 'sig11')"
                data-tooltip="SIG11"
                @click="setTab('settings', 'sig11')"
            >
                <icon name="protocol-sig11" />
            </li>
            <li
                class="btn btn-menu tab tooltip tooltip-bottom"
                :class="classes('tabs', 'webhooks')"
                data-tooltip="Webhooks"
                @click="setTab('settings', 'webhooks')"
            >
                <icon name="webhooks" />
            </li>
        </ul>
    </panel>

    <content>
        <!-- General settings -->
        <div class="tab" :class="{active: tabs.active === 'general'}">
            <FieldSelect
                v-model="language.selected"
                :help="$t('language used throughout the application.')"
                :label="$t('application language')"
                name="language"
                :options="language.options"
            />

            <FieldSelect
                v-model="settings.ringtones.selected"
                :label="$t('ringtone')"
                name="ringtone"
                :options="settings.ringtones.options"
            >
                <button
                    slot="button"
                    class="btn"
                    :disabled="playing.ringOutput"
                    @click="playSound('ringTone', 'ringOutput')"
                >
                    <icon name="call-active" />
                </button>
            </FieldSelect>

            <FieldCheckbox
                v-model="app.vault.store"
                :help="$t('automatically unlock your session after restart.')"
                :label="$t('remember session')"
                name="store_key"
            />
        </div>

        <!-- Device settings -->
        <div class="tab" :class="{active: tabs.active === 'devices'}">
            <Devices :stream="media.stream[media.stream.type]" />
        </div>

        <!-- SIP preferences -->
        <div class="tab" :class="{active: tabs.active === 'sip'}">
            <FieldCheckbox
                v-model="sip.toggled"
                elementclass="t-cb-sip-toggled"
                :help="$t('calling on the network of a SIP provider.')"
                :label="`SIP ${$t('network')} (${$t('centralized')})`"
                name="sip_enabled"
            />

            <div v-if="!sip.toggled" class="sip-disclaimer">
                <b>{{ $t('disclaimer').toUpperCase() }}:</b><br>
                {{ $t('{name} supports connecting to SIP networks, but {vendor} is not a SIP provider.', {name: app.name, vendor: app.vendor.name}).ca() }}
                {{ $t('in no event will {vendor} be liable for any loss, damage or fraud that may result from using {name} for SIP calling.', {name: app.name, vendor: app.vendor.name}).ca() }}
            </div>

            <FieldText
                v-if="sip.toggled"
                v-model="sip.endpoint"
                elementclass="t-txt-sip-endpoint"
                help="SIP WebSocket Service"
                :label="`SIP-WSS ${$t('domain')}`"
                name="sip_endpoint"
                placeholder="e.g. sip.websocket.tld"
                :validation="$v.sip.endpoint"
            />

            <FieldText
                v-if="sip.toggled"
                v-model="sip.account.username"
                elementclass="t-txt-sip-username"
                :label="`SIP ${$t('extension')}`"
                name="sip_username"
                placeholder="1000"
                :validation="$v.sip.account.username"
            />

            <FieldPassword
                v-if="sip.toggled"
                v-model="sip.account.password"
                elementclass="t-txt-sip-password"
                :label="`SIP ${$t('password')}`"
                name="sip_password"
                :placeholder="`SIP ${$t('password')}`"
                :validation="$v.sip.account.password"
            />
        </div>

        <!-- SIG11 preferences -->
        <div class="tab" :class="{active: tabs.active === 'sig11'}">
            <FieldCheckbox
                v-model="sig11.toggled"
                :help="$t('free, privacy-friendly calling on SIG11 network.')"
                :label="`SIG11 ${$t('network')} (${$t('decentralized')})`"
                name="sig11_enabled"
            />

            <FieldText
                v-if="sig11.toggled"
                v-model="sig11.endpoint"
                help="SIG11 WebSocket Service"
                :label="`SIG11 ${$t('domain')}`"
                name="sig11_endpoint"
                placeholder="e.g. sig11.websocket.tld"
                :validation="$v.sig11.endpoint"
            />

            <FieldText
                v-if="sig11.toggled"
                v-model="sig11.identity.name"
                :help="$t('your display name to others.')"
                :label="$t('display name')"
                name="sig11_name"
            />

            <FieldText
                v-if="sig11.toggled"
                v-model="sig11.identity.number"
                :help="$t('the number that people can reach you on.')"
                :label="`SIG11 ${$t('number')}`"
                name="sig11_number"
            />
        </div>

        <!-- Webhooks settings -->
        <div class="tab" :class="{active: tabs.active === 'webhooks'}">
            <FieldCheckbox
                v-model="webhooks.enabled"
                elementclass="t-cb-webhooks-toggled"
                :help="$t('opens a third-party information provider in a new tab.')"
                :label="$t('webhooks')"
                name="webhooks_enabled"
            />

            <FieldText
                v-if="sip.toggled"
                v-model="webhooks.url"
                elementclass="t-txt-sip-endpoint"
                :help="$t('the url to open when a call comes in.')"
                :label="`webhook url`"
                name="sip_endpoint"
                placeholder="e.g. sip.websocket.tld"
                :validation="$v.sip.endpoint"
            />
        </div>
    </content>
</component>
