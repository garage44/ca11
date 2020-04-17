import Module from '../lib/module.js'

// Cap the maximum amount of stored activities, so the
// localStorage won't be grinded to a halt.
const MAX_ACTIVITIES = 50

/**
* Main entrypoint for Activity.
* @memberof AppBackground.plugins
*/
class ModuleActivity extends Module {

    constructor(app) {
        super(app)

        this.app.on('caller:call-rejected', ({call}) => {
            let activity = {
                description: {
                    number: call.number,
                    protocol: call.protocol,
                },
                icon: `call-missed-${call.direction}`,
                selected: false,
                status: call.direction === 'outgoing' ? 'unanswered' : 'missed',
            }

            this.addActivity(activity)
        })

        this.app.on('caller:call-ended', ({call}) => {
            let activity = {
                description: {
                    number: call.number,
                    protocol: call.protocol,
                },
                icon: `call-${call.direction}`,
                selected: false,
                status: 'finished',
            }

            this.addActivity(activity)
        })
    }


    _initialState() {
        return {
            activities: [],
            filters: {
                missedIncoming: false,
                missedOutgoing: false,
                reminders: false,
            },
            unread: false,
        }
    }


    addActivity(activity) {
        activity.date = new Date().getTime()
        activity.id = shortid()
        activity.remind = false

        let activities = this.app.state.activities.activities
        activities.unshift(activity)

        if (activities.length > MAX_ACTIVITIES) {
            // Check which discarded activities are reminders first.
            let reminders = activities.slice(MAX_ACTIVITIES).filter((i) => i.remind)
            // Slice the list of activities and add the reminders at the end.
            activities = activities.slice(0, MAX_ACTIVITIES).concat(reminders)
        }

        // New activity is added. Mark it as unread when the current layer
        // is not set on `activity`. The unread property is deactivated again
        // when the activity component mounts.
        this.app.setState({
            activities: {
                activities,
                unread: this.app.state.ui.layer !== 'activity',
            },
        }, {persist: true})
    }


    toString() {
        return `${this.app}[mod-activity] `
    }
}

export default ModuleActivity
