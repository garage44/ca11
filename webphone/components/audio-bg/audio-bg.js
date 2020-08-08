/**
 * Provides sound while the call view is not focussed.
 * @param {App} app - The CA11 app object
 * @returns {Object} Vue.Component
 */
export default (app) => {

    const sharedComputed = app.helpers.sharedComputed()

    return {
        computed: {
            call: sharedComputed.callActive,
        },
        store: {
            calls: 'caller.calls',
        },
    }
}
