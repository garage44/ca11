export default (app) => {

    const Page = {
        computed: {
            page: function() {
                let topic

                if (this.$route.name === 'developers') {
                    topic = this.topics.developer.find((i) => i.name === this.$route.params.topic_id)
                } else if (this.$route.name === 'users') {
                    topic = this.topics.user.find((i) => i.name === this.$route.params.topic_id)
                }

                return topic.content
            },
        },
        methods: {
            classes: function(block) {
                let classes = {}
                if (block === 'component') {
                    let topic = this.topics.developer.find((i) => i.name === this.$route.params.topic_id)
                    if (topic) classes.topic = true
                    else classes.readme = true
                }
                return classes
            },
        },
        render: templates.page.r,
        staticRenderFns: templates.page.s,
        store: {
            app: 'app',
            topics: 'pages.topics',
            vendor: 'vendor',
        },
    }

    return Page
}
