<component class="c-settings module t-settings">
    <panel class="root">
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
                :class="classes('tabs', 'devices')"
                :data-tooltip="$t('devices')"
                @click="setTab('settings', 'devices')"
            >
                <icon name="headset_mic" />
            </li>
            <li
                class="btn btn-menu tab tooltip tooltip-bottom t-tab-sip"
                :class="classes('tabs', 'signalling')"
                data-tooltip="Signalling"
                @click="setTab('settings', 'signalling')"
            >
                <icon name="signalling" />
            </li>
            <li
                class="btn btn-menu tab tooltip tooltip-bottom"
                :class="classes('tabs', 'misc')"
                :data-tooltip="$t('Miscellaneous')"
                @click="setTab('settings', 'misc')"
            >
                <icon name="settings-misc" />
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
        <!-- Misc settings -->
        <div class="tab" :class="{active: tabs.active === 'misc'}">
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

        <!-- Signalling preferences -->
        <div class="tab subtabs" :class="{active: tabs.active === 'signalling'}">
            <panel class="subpanel">
                <ul class="tabs">
                    <li
                        class="btn btn-menu tab tooltip tooltip-bottom"
                        :class="classes('subtabs', 'ion')"
                        :data-tooltip="$t('devices')"
                        @click="setTab('settings', 'signalling', 'ion')"
                    >
                        ION
                    </li>
                    <li
                        class="btn btn-menu tab tooltip tooltip-bottom"
                        :class="classes('subtabs', 'sip')"
                        :data-tooltip="$t('devices')"
                        @click="setTab('settings', 'signalling', 'sip')"
                    >
                        SIP
                    </li>
                    <li
                        class="btn btn-menu tab tooltip tooltip-bottom"
                        :class="classes('subtabs', 's11')"
                        :data-tooltip="$t('devices')"
                        @click="setTab('settings', 'signalling', 's11')"
                    >
                        SIG11
                    </li>
                </ul>
            </panel>

            <content class="subcontent">
                <!-- SIG11 -->
                <div class="tab subtab" :class="{active: tabs.subtabs.signalling.active === 'ion'}">
                    <FieldCheckbox
                        v-model="ion.enabled"
                        elementclass="t-cb-ion-toggled"
                        :help="$t('calling on the network of an ION-SFU provider.')"
                        :label="`ION SFU (${$t('centralized')})`"
                        name="ion_enabled"
                    />
                </div>
                <!-- SIP -->
                <div class="tab subtab" :class="{active: tabs.subtabs.signalling.active === 'sip'}">
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
                        v-model="sip.domain"
                        elementclass="t-txt-sip-domain"
                        :help="$t('domain of the SIP WebSocket service')"
                        :label="`SIP ${$t('domain')}`"
                        name="sip_domain"
                        placeholder="sip.websocket.tld"
                        :validation="$v.sip.domain"
                    />

                    <FieldText
                        v-if="sip.toggled"
                        v-model="sip.identity.name"
                        elementclass="t-txt-sip-name"
                        :help="$t('SIP Contact name')"
                        :label="`${$t('Display name')}`"
                        name="sip_name"
                        placeholder="Alice, Bob, Carol, Dan, Erin..."
                        :validation="$v.sip.identity.endpoint"
                    />

                    <FieldText
                        v-if="sip.toggled"
                        v-model="sip.identity.endpoint"
                        elementclass="t-txt-sip-endpoint"
                        :help="$t('also known as the SIP extension')"
                        :label="`${$t('endpoint')}`"
                        name="sip_endpoint"
                        placeholder="1000"
                        :validation="$v.sip.identity.endpoint"
                    />

                    <FieldPassword
                        v-if="sip.toggled"
                        v-model="sip.identity.password"
                        elementclass="t-txt-sip-password"
                        :help="$t('password for the SIP extension')"
                        :label="`${$t('password')}`"
                        name="sip_password"
                        :placeholder="`SIP ${$t('password')}`"
                        :validation="$v.sip.identity.password"
                    />
                </div>

                <!-- SIG11 -->
                <div class="tab subtab" :class="{active: tabs.subtabs.signalling.active === 's11'}">
                    <FieldCheckbox
                        v-model="sig11.toggled"
                        :help="$t('free as in freedom, privacy-friendly calling on S11 network')"
                        :label="`SIG11 ${$t('network')} (${$t('decentralized')})`"
                        name="sig11_enabled"
                    />

                    <FieldText
                        v-if="sig11.toggled"
                        v-model="sig11.domain"
                        :help="$t('Domain of the SIG11 WebSocket Service')"
                        :label="`SIG11 ${$t('domain')}`"
                        name="sig11_domain"
                        placeholder="sig11.websocket.tld"
                        :validation="$v.sig11.domain"
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
                        :label="`${$t('number')}`"
                        name="sig11_number"
                    />
                </div>
            </content>
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
                :validation="$v.sip.domain"
            />
        </div>
    </content>
</component>
