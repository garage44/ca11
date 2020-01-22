<component class="c-contacts module">

    <panel>
        <div class="module-name">{{$t('contacts')}}</div>

        <div class="actions">
            <button class="action button button--menu"
                :class="{'active': editMode}"
                @click.stop="toggleEditMode()">
                <icon name="edit"/>
            </button>

            <button class="action button button--menu"
                @click.stop="addContact()"
                :disabled="!editMode">
                <icon name="contact-add"/>
            </button>

            <button class="action button button--menu"
                :class="{active: subscribeAll}"
                @click.stop="toggleSubscribeAll()"
                :disabled="!editMode">
                <icon name="eye"/>
            </button>
        </div>

        <div class="filters">
            <button class="filter tooltip tooltip-right"
                :class="classes('filter-favorites')"
                :data-tooltip="$t('favorites')"
                @click="toggleFilterFavorites()">
                <icon name="star"/>
            </button>
            <button class="filter tooltip tooltip-right"
                :class="classes('filter-presence')"
                :data-tooltip="$t('presence')"
                @click="toggleFilterPresence()">
                <icon name="presence"/>
            </button>
        </div>
    </panel>

    <content class="no-padding" v-click-outside="toggleSelectItem">

        <div class="items">
            <div v-if="!filteredContacts.length" class="items-empty">
                <icon class="icon" name="contact-add"/>
                <div class="text cf">{{$t('no {target}', {target: $t('contacts')})}}</div>
            </div>

            <div v-else class="item contact" :class="{selected: contact.selected}"
                @click.stop="toggleSelectItem(contact, true)"
                v-for="contact in filteredContacts">

                <div class="header">
                    <icon class="header-icon" name="contact"/>

                    <div class="header-text">
                        <div class="header-title">
                            <input class="editable" type="text" v-model="contact.name" :readonly="!editMode"/>
                        </div>
                        <div class="header-description endpoint-leds">
                            <!-- Show endpoints and their status as dots -->
                            <div class="led" :class="endpoint.status"
                                v-if="editMode || endpointActive(endpoint)"
                                v-for="endpoint in contact.endpoints"/>
                        </div>
                    </div>

                    <div class="options">
                        <button class="option" :class="classes('favorite-button', contact.favorite)"
                            @click.stop="toggleFavorite(contact)" v-if="!editMode">
                            <icon name="star" :class="contact.status"/>
                        </button>

                        <button class="option" v-if="editMode && contact.selected"
                            @click.stop="addEndpoint(contact)">
                            <icon name="phone-add"/>
                        </button>
                        <button class="option" v-if="editMode" @click.stop="deleteContact(contact)">
                            <icon name="delete"/>
                        </button>

                        <!-- <button class="item-option green" v-show="transferStatus === 'select'" :disabled="!isTransferTarget(contact)" v-on:click.once="callContact(contact)">
                            <icon name="transfer"/>
                        </button> -->
                        <!-- <button class="item-option green"
                            v-show="!transferStatus"
                            :disabled="callingDisabled || !callsReady || !contactIsCallable(contact)"
                            @click.stop="callContact(contact)">
                            <icon name="phone" :class="contact.status"/>
                        </button> -->
                    </div>
                </div>


                <div v-if="contact.selected" class="context">
                    <div class="context-empty" v-if="!Object.keys(contact.endpoints).length">
                        <span class="cf">{{$t('no contact info')}}...</span>
                    </div>

                    <!-- Contains all collapsed endpoints -->
                    <div class="entry" v-if="editMode || endpointActive(endpoint)" v-for="endpoint in contact.endpoints">
                        <!-- editMode; toggle protocol -->
                        <button v-if="editMode" class="icon editable"
                            :class="classes('entry-status', endpoint)"
                            @click.stop="toggleEndpointProtocol(contact, endpoint)">
                            <icon :name="`protocol-${endpoint.protocol}`"/>
                        </button>
                        <button v-else class="icon editable"
                            :class="endpoint.status"
                            :disabled="!endpoint.number"
                            @click.stop="callEndpoint(contact, endpoint)">
                            <icon :name="`protocol-${endpoint.protocol}`"/>
                        </button>


                        <!-- sip/sig11 phonenumber/pubkey text input -->
                        <input v-if="endpoint.protocol === 'sip'" class="input editable" type="text"
                            v-model="endpoint.number"
                            :placeholder="$t('number')"
                            :readonly="!editMode"/>
                        <input v-else-if="endpoint.protocol === 'sig11'" class="input editable" type="text"
                            v-model="endpoint.pubkey"
                            :readonly="!editMode"
                            :placeholder="$t('public key')"/>

                        <!-- entry options at the right -->
                        <div class="options">
                            <button v-if="editMode" class="option"
                                :class="{active: endpoint.subscribe}"
                                :disabled="!endpoint.number"
                                @click.stop="toggleSubscribe(contact, endpoint)">
                                <icon name="eye"/>
                            </button>
                            <button v-if="editMode" class="option"
                                @click.stop="deleteEndpoint(contact, endpoint)">
                                <icon name="delete"/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </content>
</component>
