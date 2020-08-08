export default function(app) {

    return {
        methods: {
            classes: function(block, notification) {
                let classes = {}
                if (block === 'notification') {
                    classes[`is-${notification.type}`] = true
                } else if (block === 'component') {
                    if (this.session.authenticated) classes.topbar = true
                }
                return classes
            },
            close: function(notification) {
                let notifications = this.notifications.filter((i) => i.id !== notification.id)
                app.setState({app: {notifications}})
            },
            openUrl: function(url) {
                window.open(url, '_blank')
            },
        },
        props: ['notification'],
        store: {
            notifications: 'app.notifications',
            session: 'session',
        },
    }
}
