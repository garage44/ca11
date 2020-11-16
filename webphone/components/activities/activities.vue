<component class="c-activities module">
    <div class="panel root">
        <div class="actions">
            <button
                :class="{'active': editMode}"
                :data-tooltip="$t('edit mode')"
                @click.stop="toggleEditMode()"
                class="action button btn-menu tooltip tooltip-bottom"
            >
                <icon name="edit" />
            </button>

            <button
                class="action button btn-menu tooltip tooltip-bottom"
                :data-tooltip="$t('clear history')"
                :disabled="!editMode" @click.stop="deleteActivities()"
            >
                <icon name="delete" />
            </button>
        </div>

        <div class="filters">
            <button
                class="filter tooltip tooltip-bottom"
                :class="classes('filter-reminders')"
                :data-tooltip="$t('reminders')"
                @click="toggleFilterReminders()"
            >
                <icon name="idea" />
            </button>

            <button
                class="filter tooltip tooltip-bottom"
                :class="classes('filter-missed-incoming')"
                :data-tooltip="$t('missed')"
                @click="toggleFilterMissedIncoming()"
            >
                <icon name="call-missed-incoming" />
            </button>

            <button
                class="filter tooltip tooltip-bottom"
                :class="classes('filter-missed-outgoing')"
                :data-tooltip="$t('unanswered')"
                @click="toggleFilterMissedOutgoing()"
            >
                <icon name="call-missed-outgoing" />
            </button>
        </div>
    </div>

    <div v-click-outside="toggleSelectItem" class="content scrollable no-padding">
        <div v-if="!filteredActivities.length" class="items-empty">
            <icon class="icon" name="activities" />
        </div>
        <div v-else class="items">
            <div
                v-for="activity of filteredActivities" :key="activity.id"
                class="item activity"
                :class="{selected: activity.selected}"
                @click.stop="toggleSelectItem(activity, true)"
            >
                <div class="header">
                    <icon class="header-icon" :name="activity.icon" />
                    <div class="header-text">
                        <div v-if="activity.contact" class="header-title">
                            {{ activity.contact.name }}
                        </div>
                        <div v-else class="header-title">
                            {{ activity.description.number }}
                        </div>
                        <div class="header-description">
                            {{ activity.description.number }} - {{ activity.date | fuzzydate }}
                        </div>
                    </div>

                    <div class="options">
                        <button
                            v-if="!editMode" class="option"
                            :class="classes('remind-button', activity)"
                            @click="toggleReminder(activity)"
                        >
                            <icon name="idea" />
                        </button>
                        <button
                            v-if="!editMode" class="option"
                            @click="callEndpoint(activity)"
                        >
                            <icon name="phone" />
                        </button>
                        <button
                            v-if="editMode" class="option"
                            @click.stop="deleteActivity(activity)"
                        >
                            <icon name="delete" />
                        </button>
                    </div>
                </div>

                <div class="context">
                    <textarea
                        v-if="activity.remind" v-model="activity.label"
                        v-autosize="activity.label"
                        class="context-label editable"
                        :placeholder="$t(activity.status)"
                        type="text"
                    />
                </div>
            </div>
        </div>
    </div>
</component>
