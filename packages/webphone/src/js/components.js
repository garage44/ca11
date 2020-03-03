import templates from './templates.js'

// Use Vuepack naming convention for templates.
import About from '../components/about/about.js'
import Activities from '../components/activities/activities.js'
import AudioBg from '../components/audio-bg/audio-bg.js'
import Call from '../components/call/call.js'
import CallInputEndpoint from '../components/call/components/input-endpoint/input-endpoint.js'
import CallKeypad from '../components/call/components/keypad/keypad.js'
import CallOptions from '../components/call/components/options/options.js'
import CallTransfer from '../components/call/components/transfer/transfer.js'

import Caller from '../components/caller/caller.js'
import CallerBar from '../components/caller/components/bar/bar.js'
import CallerSwitcher from '../components/caller/components/switcher/switcher.js'

import Contacts from '../components/contacts/contacts.js'
import Devices from '../components/devices/devices.js'
import DevicesConfig from '../components/devices/components/config/config.js'
import DevicesPermission from '../components/devices/components/permission/permission.js'

import Dnd from '../components/dnd/dnd.js'
import Field from '../components/field/field.js'

import Main from '../components/main/main.js'
import MenuCommunicate from '../components/menu-communicate/menu-communicate.js'
import MenuContext from '../components/menu-context/menu-context.js'
import Network from '../components/network/network.js'
import Notifications from '../components/notifications/notifications.js'
import ProtocolStatus from '../components/protocol-status/protocol-status.js'
import Session from '../components/session/session.js'
import Settings from '../components/settings/settings.js'
import Soundmeter from '../components/soundmeter/soundmeter.js'
import Stream from '../components/stream/stream.js'
import StreamView from '../components/stream-view/stream-view.js'


export default function(app) {
    app.templates = templates

    const components = {
        About,
        Activities,
        AudioBg,
        Call,
        CallKeypad,
        CallOptions,
        CallTransfer,
        Caller,
        CallerBar,
        CallerSwitcher,
        Contacts,
        Devices,
        DevicesConfig,
        DevicesPermission,
        Dnd,
        Field,
        Main,
        MenuCommunicate,
        MenuContext,
        Network,
        Notifications,
        ProtocolStatus,
        Session,
        Settings,
        Soundmeter,
        Stream,
        StreamView,
        CallInputEndpoint
    }


    for (const name of Object.keys(components)) {
        const definition = components[name](app)
        let component
        if (definition.components) {
            Object.assign(components, definition.components)
            component = definition.component

            for (const [name, component] of Object.entries(definition.components)) {
                let _component = component(app, definition.component)
                _component = Object.assign(_component, {
                    render: app.templates[name].r,
                    staticRenderFns: app.templates[name].s
                })

                components[name] = Vue.component(name, _component)
            }
        } else {
            component = definition
        }
        Object.assign(component, {
            render: templates[name].r,
            staticRenderFns: templates[name].s
        })

        components[name] = Vue.component(name, component)

    }

    for (const name of Object.keys(templates)) {
        if (!components[name]) {
            app.logger.warn(`component missing for template: ${name}`)
        }
    }


    return components
}