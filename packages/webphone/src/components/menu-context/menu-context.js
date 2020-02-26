export default (app) => {
    /**
    * @memberof fg.components
    */
    const MenuContext = {
        computed: app.helpers.sharedComputed(),
        data: function() {
            return {
                customPlugins: app.modules,
            }
        },
        methods: Object.assign({
            classes: function(block) {
                let classes = {}
                // We assume here that a block is always an option. Change
                // this logic if other kind of blocks are required.
                classes.active = (this.layer === block)

                if (block === 'activities') {
                    classes.unread = this.activities.unread
                } else if (block === 'caller') {
                    classes.disabled = !this.app.online
                }

                return classes
            },
            logout: function() {
                app.session.close()
            },
        }, app.helpers.sharedMethods()),
        store: {
            app: 'app',
            layer: 'ui.layer',
        },
    }

    return MenuContext
}
