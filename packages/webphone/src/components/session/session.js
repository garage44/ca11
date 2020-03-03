import '@/icons/caller.js'
import '@/icons/delete.js'
import '@/icons/phone.js'
import '@/icons/phone-add.js'

export default (app) => {
    const v = Vuelidate.validators
    let sloganInterval

    /**
    * @memberof fg.components
    */
    const Session = {
        computed: {
            slogan: function() {
                return this.slogans[this.currentSlogan]
            },
        },
        created: function() {
            this.sig11.identity.number = this.generatePhonenumber()
            this.password = this.generatePassword()
            // if (this.sig11.identity.name === '') {
            //     this.sig11.identity.name = app.state.session.username
            // }
            // if (this.sig11.identity.number === '') {

            // }

            // if (this.password === '')
        },
        data: function() {
            return {
                currentSlogan: 0,
                password: '',
                slogans: [
                    {id: 0, phrase: this.$t('your own number - instantly'), show: true},
                    {id: 2, phrase: this.$t('receive and make calls'), show: false},
                    {id: 3, phrase: this.$t('privacy-friendly & secure'), show: false},
                    {id: 4, phrase: this.$t('high quality audio and video'), show: false},
                    {id: 5, phrase: this.$t('screen- & filesharing'), show: false},
                ],
                validateApi: false,
            }
        },
        destroyed: function() {
            clearInterval(sloganInterval)
        },
        methods: Object.assign({
            generatePassword: function() {
                return Math.random().toString(36).slice(-8)
            },
            generatePhonenumber: function() {
                const min = 1100000000
                const max = 1199999999
                return String(Math.floor(Math.random() * (max - min) + min))
            },
            login: function() {
                if (this.$v.$invalid) return

                if (this.app.session.active === 'new' || !this.app.session.available.length) {
                    this.session.username = this.sig11.identity.number
                    app.session.start({
                        password: this.password,
                        username: this.session.username,
                    })
                } else {
                    app.session.unlock({
                        password: this.password,
                        username: this.app.session.active,
                    })
                }
            },
            newSession: function() {
                app.setState({app: {session: {active: 'new'}}, session: {
                    password: this.generatePassword(),
                    username: this.generatePhonenumber(),
                }})
            },
            removeSession: async function(sessionId) {
                await app.session.destroy(sessionId)
                this.sig11.identity.number = this.generatePhonenumber()
                this.password = this.generatePassword()
            },
            selectSession: function(session = null) {
                app.session.change(session)
                this.password = ''
                this.sig11.identity.number = session
            },
        }, app.helpers.sharedMethods()),
        mounted: function() {
            sloganInterval = setInterval(() => {
                this.slogans.forEach((s) => {s.show = false})
                this.currentSlogan = (this.currentSlogan + 1) % this.slogans.length
                this.slogans[this.currentSlogan].show = true
            }, 3000)
        },
        store: {
            app: 'app',
            session: 'session',
            sig11: 'sig11',
            vendor: 'app.vendor',
        },
        updated: function() {
            // Validation needs to be reset after an update, so
            // the initial validation is only done after a user
            // action.
            this.$v.$reset()
        },
        validations: function() {
            // Bind the API response message to the validator $params.
            let validations = {
                password: {
                    minLength: v.minLength(6),
                    required: v.required,
                },
                sig11: {
                    identity: {
                        number: {
                            minLength: v.minLength(3),
                            required: v.required,
                        },
                    },
                },
            }

            return validations
        },
        watch: {
            'session.username': function(username) {
                app.setState({session: {username}})
            },
        },
    }


    return Session
}
