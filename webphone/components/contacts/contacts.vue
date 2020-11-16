<component class="c-contacts module">
    <div class="panel root">
        <div class="actions">
            <button
                :class="{'active': editMode}"
                @click.stop="toggleEditMode()"
                class="action button btn-menu"
            >
                <icon name="edit" />
            </button>

            <button
                class="action button btn-menu"
                :disabled="!editMode"
                @click.stop="addContact()"
            >
                <icon name="contact-add" />
            </button>

            <button
                class="action button btn-menu"
                :class="{active: subscribeAll}"
                :disabled="!editMode"
                @click.stop="toggleSubscribeAll()"
            >
                <icon name="eye" />
            </button>
        </div>

        <div class="filters">
            <button
                class="filter tooltip tooltip-right"
                :class="classes('filter-favorites')"
                :data-tooltip="$t('favorites')"
                @click="toggleFilterFavorites()"
            >
                <icon name="star" />
            </button>
            <button
                class="filter tooltip tooltip-right"
                :class="classes('filter-presence')"
                :data-tooltip="$t('presence')"
                @click="toggleFilterPresence()"
            >
                <icon name="presence" />
            </button>
        </div>
    </div>

    <div v-click-outside="toggleSelectItem" class="content no-padding">
        <div v-if="!filteredContacts.length" class="items-empty">
            <icon class="icon" name="contact" />
        </div>
        <div v-else class="items">
            <div
                v-for="contact in filteredContacts" :key="contact.id"
                class="item contact"
                :class="{selected: contact.selected}"
                @click.stop="toggleSelectItem(contact, true)"
            >
                <div class="header">
                    <icon class="header-icon" name="contact" />

                    <div class="header-text">
                        <div class="header-title">
                            <input
                                v-model="contact.name" class="editable"
                                :readonly="!editMode"
                                type="text"
                            >
                        </div>
                        <div class="header-description endpoint-leds">
                            <!-- Show endpoints and their status as dots -->
                            <div
                                v-for="endpoint in contact.endpoints" v-if="editMode || endpointActive(endpoint)"
                                :key="endpoint.id"
                                class="led"
                                :class="endpoint.status"
                            />
                        </div>
                    </div>

                    <div class="options">
                        <button
                            v-if="!editMode" class="option"
                            :class="classes('favorite-button', contact.favorite)" @click.stop="toggleFavorite(contact)"
                        >
                            <icon :class="contact.status" name="star" />
                        </button>

                        <button
                            v-if="editMode && contact.selected" class="option"
                            @click.stop="addEndpoint(contact)"
                        >
                            <icon name="phone-add" />
                        </button>
                        <button v-if="editMode" class="option" @click.stop="deleteContact(contact)">
                            <icon name="delete" />
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
                    <div v-if="!Object.keys(contact.endpoints).length" class="context-empty">
                        <span class="cf">{{ $t('no contact info') }}...</span>
                    </div>

                    <!-- Contains all collapsed endpoints -->
                    <div
                        v-for="endpoint in contact.endpoints" v-if="editMode || endpointActive(endpoint)"
                        :key="endpoint.id"
                        class="entry"
                    >
                        <!-- editMode; toggle protocol -->
                        <button
                            v-if="editMode" class="icon editable"
                            :class="classes('entry-status', endpoint)"
                            @click.stop="toggleEndpointProtocol(contact, endpoint)"
                        >
                            <icon :name="`protocol-${endpoint.protocol}`" />
                        </button>
                        <button
                            v-else class="icon editable"
                            :class="endpoint.status"
                            :disabled="!endpoint.number"
                            @click.stop="callEndpoint(contact, endpoint)"
                        >
                            <icon :name="`protocol-${endpoint.protocol}`" />
                        </button>


                        <!-- sip/sig11 phonenumber/pubkey text input -->
                        <input
                            v-if="endpoint.protocol === 'sip'" v-model="endpoint.number"
                            class="input editable"
                            :placeholder="$t('number')"
                            :readonly="!editMode"
                            type="text"
                        >
                        <input
                            v-else-if="endpoint.protocol === 'sig11'" v-model="endpoint.pubkey"
                            class="input editable"
                            :placeholder="$t('public key')"
                            :readonly="!editMode"
                            type="text"
                        >

                        <!-- entry options at the right -->
                        <div class="options">
                            <button
                                v-if="editMode" class="option"
                                :class="{active: endpoint.subscribe}"
                                :disabled="!endpoint.number"
                                @click.stop="toggleSubscribe(contact, endpoint)"
                            >
                                <icon name="eye" />
                            </button>
                            <button
                                v-if="editMode" class="option"
                                @click.stop="deleteEndpoint(contact, endpoint)"
                            >
                                <icon name="delete" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</component>
