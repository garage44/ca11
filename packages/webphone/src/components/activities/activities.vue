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

            <div v-if="!filteredActivities.length" class="items__empty">
                <icon class="items__empty-icon" name="activities"/>
                <div class="items__empty-text cf">{{$t('no {target}', {target: $t('activity')})}}</div>
            </div>

            <div class="item activity"
                :class="{selected: activity.selected}"
                v-else
                v-for="activity of filteredActivities"
                @click.stop="toggleSelectItem(activity, true)">

                <div class="item__header">
                    <icon class="item__icon" :name="activity.icon"/>
                    <div class="item__text">
                        <div v-if="activity.contact" class="item__title">
                            {{activity.contact.name}}
                        </div>
                        <div v-else class="item__title">
                            {{activity.description.number}}
                        </div>
                        <div class="item__description">
                            {{activity.description.number}} - {{activity.date | fuzzydate}}
                        </div>
                    </div>

                    <div class="item__options">
                        <button class="item__option"
                            :class="classes('remind-button', activity)"
                            v-if="!editMode"
                            v-on:click="toggleReminder(activity)">
                            <icon name="idea"/>
                        </button>
                        <button class="item__option"
                            v-if="!editMode"
                            v-on:click="callEndpoint(activity)">
                            <icon name="phone"/>
                        </button>
                        <button class="item__option"
                            v-if="editMode"
                            @click.stop="deleteActivity(activity)">
                            <icon name="delete"/>
                        </button>
                    </div>
                </div>

                <div class="item__context">
                    <textarea class="item__label editable" type="text"
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
