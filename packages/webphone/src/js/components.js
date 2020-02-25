import templates from './templates.js'

// Use Vuepack naming convention for templates.
import About from '../components/about/about.js'
import Activities from '../components/activities/activities.js'
import AudioBg from '../components/audio-bg/audio-bg.js'
import Call from '../components/call/call.js'
import Caller from '../components/caller/caller.js'
import Contacts from '../components/contacts/contacts.js'
import Devices from '../components/devices/devices.js'
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
    const components = {
        About,
        Activities,
        AudioBg,
        Call,
        Caller,
        Contacts,
        Devices,
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
    }

    for (const name of Object.keys(components)) {
        const _component = components[name](app)
        Object.assign(_component, {
            render: templates[name].r,
            staticRenderFns: templates[name].s
        })

        components[name] = Vue.component(name, _component)

    }

    return components
}