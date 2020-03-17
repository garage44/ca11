export default (app) => {
    /**
    * @memberof fg.components
    */
    const About = {
        methods: app.helpers.sharedMethods(),
        store: {
            app: 'app',
            vendor: 'app.vendor',
        },
    }

    return About
}
