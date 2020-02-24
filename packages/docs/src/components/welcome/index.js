export default (app) => {

    const Welcome = {
        render: templates.welcome.r,
        staticRenderFns: templates.welcome.s,
        store: {
            app: 'app',
            topics: 'pages.topics',
            vendor: 'vendor',
        },
    }

    return Welcome
}
