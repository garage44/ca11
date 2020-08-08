export default function(app, module) {
    return {
        _statusFromXml: function(notification) {
            let parser = new DOMParser()
            let xmlDoc = parser ? parser.parseFromString(notification.request.body, 'text/xml') : null
            window.xml = xmlDoc
            let status = 'available'
            if (xmlDoc.getElementsByTagName('rpid:on-the-phone').length) status = 'busy'
            return status
        },


        subscribe: function(contact, endpoint) {
            if (!endpoint.number) return

            const ua = app.modules.sip.ua
            module.subscriptions[endpoint.id] = ua.subscribe(endpoint.number, 'presence',
                {extraHeaders: ['Accept: application/pidf+xml']})

            // Subscription failed; set failed state.
            module.subscriptions[endpoint.id].on('failed', () => {
                module.subscriptions[endpoint.id].close()
                delete module.subscriptions[endpoint.id]
                const path = `contacts.contacts.${contact.id}.endpoints.${endpoint.id}`
                const action = {action: 'upsert', path, persist: true}
                app.setState({status: 'failed', subscribe: false}, action)

                // Return to normal unsubscribed state after a short delay.
                setTimeout(() => {
                    app.setState({status: 'not-set'}, action)
                }, 1500)
            })

            module.subscriptions[endpoint.id].on('accepted', () => {
                // Register notify event.
                module.subscriptions[endpoint.id].on('notify', (notification) => {
                    const status = this._statusFromXml(notification)

                    app.setState({status, subscribe: true}, {
                        action: 'upsert',
                        path: `contacts.contacts.${contact.id}.endpoints.${endpoint.id}`,
                        persist: true,
                    })
                })
            })
        },


        unsubscribe: function(contact, endpoint) {
            if (module.subscriptions[endpoint.id]) {
                module.subscriptions[endpoint.id].removeAllListeners('notify')
                module.subscriptions[endpoint.id].close()
                delete module.subscriptions[endpoint.id]
            }

            app.setState({status: 'not-set', subscribe: false}, {
                action: 'upsert',
                path: `contacts.contacts.${contact.id}.endpoints.${endpoint.id}`,
                persist: true,
            })
        },
    }
}
