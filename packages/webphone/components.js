

// Use Vuepack naming convention for templates.
import About from './components/about/about.js'
import Activities from './components/activities/activities.js'
import AudioBg from './components/audio-bg/audio-bg.js'

import Contacts from './components/contacts/contacts.js'
import Devices from './components/devices/devices.js'
import DevicesConfig from './components/devices/components/config/config.js'
import DevicesPermission from './components/devices/components/permission/permission.js'
import Dialer from './components/dialer/dialer.js'
import DialerEndpoint from './components/dialer/components/endpoint/endpoint.js'
import Dnd from './components/dnd/dnd.js'
import Dtmf from './components/dtmf/dtmf.js'
import Field from './components/field/field.js'

import Main from './components/main/main.js'
import MenuCall from './components/menu-call/menu-call.js'
import MenuCallOptions from './components/menu-call/components/options/options.js'
import MenuCommunicate from './components/menu-communicate/menu-communicate.js'
import MenuCommunicateSwitcher from './components/menu-communicate/components/switcher/switcher.js'
import MenuContext from './components/menu-context/menu-context.js'
import Notifications from './components/notifications/notifications.js'
import ProtocolStatus from './components/protocol-status/protocol-status.js'
import Session from './components/session/session.js'
import Settings from './components/settings/settings.js'
import Soundmeter from './components/soundmeter/soundmeter.js'
import Stream from './components/stream/stream.js'
import StreamControls from './components/stream-controls/stream-controls.js'
import StreamInfo from './components/stream-info/stream-info.js'
import StreamView from './components/stream-view/stream-view.js'
import templates from './templates.js'
import Transfer from './components/transfer/transfer.js'
import Vue from 'vue/dist/vue.runtime.js'


export default function(app) {
    app.templates = templates

    const components = {
        About,
        Activities,
        AudioBg,
        Contacts,
        Devices,
        DevicesConfig,
        DevicesPermission,
        Dialer,
        DialerEndpoint,
        Dnd,
        Dtmf,
        Field,
        Main,
        MenuCall,
        MenuCallOptions,
        MenuCommunicate,
        MenuCommunicateSwitcher,
        MenuContext,
        Notifications,
        ProtocolStatus,
        Session,
        Settings,
        Soundmeter,
        Stream,
        StreamControls,
        StreamInfo,
        StreamView,
        Transfer,
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
                    staticRenderFns: app.templates[name].s,
                })

                components[name] = Vue.component(name, _component)
            }
        } else {
            component = definition
        }
        Object.assign(component, {
            render: templates[name].r,
            staticRenderFns: templates[name].s,
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