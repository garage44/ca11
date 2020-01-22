<component class="c-activities module">

    <panel>
        <div class="module-name">{{$t('activity')}}</div>

        <div class="actions">
            <button class="action button button--menu" :class="{'active': editMode}" @click.stop="toggleEditMode()">
                <icon name="edit"/>
            </button>

            <button class="action button button--menu" :disabled="!editMode" @click.stop="deleteActivities()">
                <icon name="delete"/>
            </button>
        </div>

        <div class="filters">
            <button class="filter tooltip tooltip-bottom"
                :class="classes('filter-reminders')"
                :data-tooltip="$t('reminders')"
                @click="toggleFilterReminders()">
                <icon name="idea"/>
            </button>

            <button class="filter tooltip tooltip-bottom"
                :class="classes('filter-missed-incoming')"
                :data-tooltip="$t('missed')"
                @click="toggleFilterMissedIncoming()">
                <icon name="call-missed-incoming"/>
            </button>

            <button class="filter tooltip tooltip-bottom"
                :class="classes('filter-missed-outgoing')"
                :data-tooltip="$t('unanswered')"
                @click="toggleFilterMissedOutgoing()">
                <icon name="call-missed-outgoing"/>
            </button>
        </div>
    </panel>

    <content class="scrollable no-padding" v-click-outside="toggleSelectItem">
        <div class="items">

            <div v-if="!filteredActivities.length" class="items-empty">
                <icon class="icon" name="activities"/>
                <div class="text cf">{{$t('no {target}', {target: $t('activity')})}}</div>
            </div>

            <div v-else class="item activity" :class="{selected: activity.selected}"
                v-for="activity of filteredActivities"
                @click.stop="toggleSelectItem(activity, true)">

                <div class="header">
                    <icon class="header-icon" :name="activity.icon"/>
                    <div class="header-text">
                        <div v-if="activity.contact" class="header-title">
                            {{activity.contact.name}}
                        </div>
                        <div v-else class="header-title">
                            {{activity.description.number}}
                        </div>
                        <div class="header-description">
                            {{activity.description.number}} - {{activity.date | fuzzydate}}
                        </div>
                    </div>

                    <div class="options">
                        <button v-if="!editMode" class="option"
                            :class="classes('remind-button', activity)"
                            v-on:click="toggleReminder(activity)">
                            <icon name="idea"/>
                        </button>
                        <button v-if="!editMode" class="option"
                            v-on:click="callEndpoint(activity)">
                            <icon name="phone"/>
                        </button>
                        <button v-if="editMode" class="option"
                            @click.stop="deleteActivity(activity)">
                            <icon name="delete"/>
                        </button>
                    </div>
                </div>

                <div class="context">
                    <textarea class="context-label editable" type="text"
                        v-if="activity.remind"
                        v-autosize="activity.label"
                        v-model="activity.label"
                        :placeholder="$t(activity.status)">
                        {{activity.label}}
                    </textarea>
                </div>
            </div>
        </div>

    </content>
</component>
