module.exports = (app) => {

    let sloganInterval

    const Sidebar = {
        computed: {
            slogan: function() {
                return this.slogans[this.currentSlogan]
            },
        },
        data: function() {
            return {
                currentSlogan: 0,
                password: '',
                slogans: [
                    {id: 0, phrase: this.$t('free web telephony'), show: true},
                    {id: 1, phrase: this.$t('secure communication'), show: false},
                    {id: 2, phrase: this.$t('no accounts'), show: false},
                    {id: 3, phrase: this.$t('your own phonenumber'), show: false},
                    {id: 4, phrase: this.$t('video conferencing'), show: false},
                    {id: 5, phrase: this.$t('screen sharing'), show: false},
                ],
                validateApi: false,
            }
        },
        destroyed: function() {
            clearInterval(sloganInterval)
        },
        methods: {
            isSection: function(section) {
                const route = this.$router.currentRoute.name
                // Opens users section by default.
                if (route === 'welcome' && section === 'users') return true
                else return route === section
            },
        },
        mounted: function() {
            sloganInterval = setInterval(() => {
                this.slogans.forEach((s) => {s.show = false})
                this.currentSlogan = (this.currentSlogan + 1) % this.slogans.length
                this.slogans[this.currentSlogan].show = true
            }, 3000)
        },
        render: templates.sidebar.r,
        staticRenderFns: templates.sidebar.s,
        store: {
            topics: 'pages.topics',
            vendor: 'vendor',
            version: 'version',
        },
    }

    return Sidebar
}
