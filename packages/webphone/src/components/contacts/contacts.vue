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

            <div v-if="!filteredContacts.length" class="items__empty">
                <icon class="items__empty-icon" name="contacts"/>
                <div class="items__empty-text cf">{{$t('no {target}', {target: $t('contacts')})}}</div>
            </div>

            <div
                v-else
                v-for="contact in filteredContacts"

                @click.stop="toggleSelectItem(contact, true)"
                class="item contact"
                :class="{selected: contact.selected}"
            >

                <div class="item__header">
                    <icon class="item__icon" name="contact"/>

                    <div class="item__text">
                        <div class="item__title">
                            <input
                                v-model="contact.name"
                                class="editable"
                                :readonly="!editMode"
                                type="text"
                            />
                        </div>
                        <div class="item__description endpoint__leds">
                            <!-- Show endpoints and their status as dots -->
                            <div
                                v-if="editMode || endpointActive(endpoint)"
                                v-for="endpoint in contact.endpoints"
                                class="endpoint__led"
                                :class="endpoint.status"
                            />
                        </div>
                    </div>

                    <div class="item__options">
                        <button
                            v-if="!editMode"
                            class="item__option"
                            :class="classes('favorite-button', contact.favorite)"
                            @click.stop="toggleFavorite(contact)"
                        >
                            <icon name="star" :class="contact.status"/>
                        </button>
                        <button
                            v-if="editMode && contact.selected"
                            class="item__option"
                            @click.stop="addEndpoint(contact)"
                        >
                            <icon name="phone-add"/>
                        </button>
                        <button
                            v-if="editMode"
                            class="item__option"
                            @click.stop="deleteContact(contact)"
                        >
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


            <div v-if="contact.selected" class="item__context context">
                    <div class="context__empty" v-if="!Object.keys(contact.endpoints).length">
                        <span class="cf">{{$t('no contact info')}}...</span>
                    </div>

                    <!-- Contains all collapsed endpoints -->
                    <div
                        v-if="editMode || endpointActive(endpoint)"
                        v-for="endpoint in contact.endpoints"
                        class="context__entry entry"
                    >

                        <!-- editMode; toggle protocol -->
                        <button
                            v-if="editMode"
                            class="context__entry-icon"
                            :class="classes('entry-status', endpoint)"
                            @click.stop="toggleEndpointProtocol(contact, endpoint)"
                        >
                            <icon :name="`protocol-${endpoint.protocol}`"/>
                        </button>
                        <button
                            v-else
                            class="context__entry-icon"
                            :class="endpoint.status"
                            :disabled="!endpoint.number"
                            @click.stop="callEndpoint(contact, endpoint)"
                        >
                            <icon :name="`protocol-${endpoint.protocol}`"/>
                        </button>

                        <!-- sip/sig11 phonenumber/pubkey text input -->
                        <input
                            v-if="endpoint.protocol === 'sip'"
                            v-model="endpoint.number"
                            class="editable context__entry-input"
                            type="text"
                            :placeholder="$t('number')"
                            :readonly="!editMode"
                        />
                        <input
                            v-else-if="endpoint.protocol === 'sig11'"
                            v-model="endpoint.pubkey"
                            class="editable context__entry-input"
                            type="text"
                            :readonly="!editMode"
                            :placeholder="$t('public key')"
                        />

                        <!-- entry options at the right -->
                        <div class="context__entry-options">
                            <button
                                v-if="editMode"
                                class="item-option"
                                :class="{active: endpoint.subscribe}"
                                :disabled="!endpoint.number"
                                @click.stop="toggleSubscribe(contact, endpoint)"
                            >
                                <icon name="eye"/>
                            </button>
                            <button
                                v-if="editMode"
                                class="item-option"
                                @click.stop="deleteEndpoint(contact, endpoint)"
                            >
                                <icon name="delete"/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </content>
</component>
