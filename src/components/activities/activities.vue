<section component class="c-activities content-wide">

    <header class="content__header header">
        <div class="header__filters">
            <button
                class="header__filter tooltip tooltip-bottom"
                :class="classes('filter-reminders')"
                :data-tooltip="$t('reminders')"
                @click="toggleFilterReminders()"
            >
                <icon name="idea"/>
            </button>
            <button
                class="header__filter tooltip tooltip-bottom"
                :class="classes('filter-missed-incoming')"
                :data-tooltip="$t('missed')"
                @click="toggleFilterMissedIncoming()"
                >
                <icon name="call-missed-incoming"/>
            </button>
            <button
                class="header__filter tooltip tooltip-bottom"
                :class="classes('filter-missed-outgoing')"
                :data-tooltip="$t('unanswered')"
                @click="toggleFilterMissedOutgoing()"
            >
                <icon name="call-missed-outgoing"/>
            </button>
        </div>

        <div class="header__text">{{$t('activity')}}</div>
        <div class="header__actions">
            <button
                class="header__action"
                :class="{'active': editMode}"
                @click.stop="toggleEditMode()"
            >
                <icon name="edit"/>
            </button>

            <button
                v-if="editMode"
                class="header__action"
                @click.stop="deleteActivities()"
            >
                <icon name="delete"/>
            </button>
        </div>

    </header>

    <main class="main scrollable items" v-click-outside="toggleSelectItem">

        <div v-if="!filteredActivities.length" class="items__empty">
            <icon class="items__empty-icon" name="activities"/>
            <div class="items__empty-text cf">{{$t('no {target}', {target: $t('activity')})}}</div>
        </div>

        <div
            v-else
            v-for="activity of filteredActivities"

            class="item activity"
            :class="{selected: activity.selected}"
            @click.stop="toggleSelectItem(activity, true)"
        >

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
                    <button
                        v-if="!editMode"
                        class="item__option"
                        :class="classes('remind-button', activity)"
                        v-on:click="toggleReminder(activity)"
                    >
                        <icon name="idea"/>
                    </button>
                    <button
                        v-if="!editMode"
                        class="item__option"
                        v-on:click="callEndpoint(activity)"
                    >
                        <icon name="phone"/>
                    </button>
                    <button
                        v-if="editMode"
                        class="item__option"
                        @click.stop="deleteActivity(activity)"
                    >
                        <icon name="delete"/>
                    </button>
                </div>
            </div>

            <div class="item__context">
                <textarea
                    v-if="activity.remind"
                    v-autosize="activity.label"
                    v-model="activity.label"
                    class="item__label editable"
                    type="text"
                    :placeholder="$t(activity.status)"
                >
                    {{activity.label}}
                </textarea>

            </div>
        </div>

    </main>
</section>
