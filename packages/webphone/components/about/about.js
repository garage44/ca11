export default (app) => {
    return {
        methods: app.helpers.sharedMethods(),
        store: {
            app: 'app',
            vendor: 'app.vendor',
        },
    }
}
