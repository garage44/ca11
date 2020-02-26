export default (app) => {

    // const components = {
    //     DevicesConfig: require('./components/config'),
    //     DevicesPermission: require('./components/permission'),
    // }

    // for (const [name, component] of Object.entries(components)) {
    //     app.components[name] = Vue.component(name, component(app))
    // }


    const Devices = {
        store: {
            app: 'app',
            media: 'settings.webrtc.media',
        },
    }

    return Devices
}
