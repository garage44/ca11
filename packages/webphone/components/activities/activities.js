export default (app) => {
    /**
    * @memberof fg.components
    */
    const Activities = {
        computed: {
            filteredActivities: function() {
                let activities = this.activities.sort(app.utils.sortByMultipleKey(['date'], -1))
                if (this.filters.reminders) activities = activities.filter((i) => i.remind)
                if (this.filters.missedIncoming) activities = activities.filter((i) => (i.status === 'missed'))
                if (this.filters.missedOutgoing) activities = activities.filter((i) => (i.status === 'unanswered'))

                // Dynamically mix in contact information.
                activities = activities.map((i) => {
                    const contactInfo = app.helpers.matchContact(i.description.number)
                    if (contactInfo) i.contact = this.contacts[contactInfo.contact]
                    else i.contact = null
                    return i
                })

                let searchQuery = this.search.input.toLowerCase()

                if (searchQuery) {
                    activities = activities.filter((i) => {
                        let match = false
                        // Search on contact name and on contact endpoint.
                        if (i.contact) {
                            match = i.contact.name.toLowerCase().includes(searchQuery)
                            if (!match && i.contact.endpoints[i.endpoint]) {
                                match = i.contact.endpoints[i.endpoint].number.includes(searchQuery)
                            }
                        }
                        // Search on contact endpoint number.
                        if (!match) match = i.description.number.includes(searchQuery)
                        return match
                    })
                }

                return activities
            },
        },
        methods: Object.assign({
            callEndpoint: function(activity) {
                app.modules.caller.call({
                    description: activity.description,
                    start: true,
                })
            },
            classes: function(block, modifier, prefix = '') {
                const classes = {}

                if (block === 'remind-button') {
                    if (modifier.remind) classes.active = true
                } else if (block === 'filter-missed-incoming') {
                    if (this.filters.missedIncoming) classes.active = true
                } else if (block === 'filter-missed-outgoing') {
                    if (this.filters.missedOutgoing) classes.active = true
                } else if (block === 'filter-reminders') {
                    if (this.filters.reminders) classes.active = true
                }
                return classes
            },
            deleteActivities: function() {
                app.setState({activities: {activities: []}}, {persist: true})
            },
            deleteActivity: function(activity) {
                app.setState(null, {
                    action: 'delete',
                    path: `activities.activities.${this.activities.findIndex(i => i.id === activity.id)}`,
                    persist: true,
                })
            },
            toggleFilterMissedIncoming: function() {
                const missedIncoming = !app.state.activities.filters.missedIncoming
                app.setState({activities: {filters: {missedIncoming}}}, {persist: true})
            },
            toggleFilterMissedOutgoing: function() {
                const missedOutgoing = !app.state.activities.filters.missedOutgoing
                app.setState({activities: {filters: {missedOutgoing}}}, {persist: true})
            },
            toggleFilterReminders: function() {
                const reminders = !app.state.activities.filters.reminders
                app.setState({activities: {filters: {reminders}}}, {persist: true})
            },
            toggleReminder: function(activity) {
                activity.remind = !activity.remind
                app.setState(activity, {path: `activities.activities.${this.activities.findIndex(i => i.id === activity.id)}`, persist: true})
            },
            toggleSelectItem: function(item, select = true) {
                for (const activity of Object.values(this.activities)) {
                    if (item.id !== activity.id) activity.selected = false
                }

                if (select) item.selected = select
                app.setState({activity: {activities: this.activities}}, {persist: true})
            },
        }, app.helpers.sharedMethods()),
        mounted: function() {
            // Mark activity as read as soon the component is opened.
            app.setState({activities: {unread: false}}, {persist: true})
        },
        store: {
            activities: 'activities.activities',
            contacts: 'contacts.contacts',
            editMode: 'app.editMode',
            filters: 'activities.filters',
            search: 'app.search',
        },
        watch: {
            // Updating all activity items after one changed
            // activity item is a bit inefficient, but fine
            // for now. Optimize this later.
            activities: {
                deep: true,
                handler: function(activities) {
                    app.setState({activities: {activities}}, {persist: true})
                },
            },
        },
    }

    return Activities
}
