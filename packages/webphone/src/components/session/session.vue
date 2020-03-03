<component class="c-session t-login" tabindex="-1" v-on:keyup.enter="login">

    <header>
        <a target="_blank" href="https://docs.ca11.app">
            <icon name="caller" class="c-session__logo"/>
        </a>

        <div class="c-session__slogan">
            <transition name="slogan" appear>
                <div v-if="slogans[currentSlogan].show" :key="slogans[currentSlogan].id">{{slogans[currentSlogan].phrase}}</div>
            </transition>
        </div>
    </header>

    <!-- Login when there are no sessions or when starting a new session-->
    <div v-if="!app.session.available.length || app.session.active === 'new' || session.status === 'login'">

        <FieldText
            v-model="sig11.identity.number"
            elementclass="t-txt-sig11-number"
            name="sig11_number"
            :help="$t('the number (or name) that people may call you on.')"
            :label="$t('choose your CA11 ID')"
            :validation="$v.sig11.identity.number"
        />

        <FieldPassword
            v-model="password"
            elementclass="t-txt-session-pw"
            name="session-pw"
            :autofocus="true"
            :help="$t('remember if you want to open your encrypted session again.')"
            :label="$t('session secret')"
            :validation="$v.password"
        />

        <div class="buttons is-centered">
            <button
                v-if="app.session.available.length"
                class="button button--widget t-btn-change-session"
                @click="selectSession()"
                :disabled="session.status === 'login'"
            >{{$t('change session')}}</button>
            <button
                class="button button--widget t-btn-login"
                :class="{'is-loading': session.status === 'login'}"
                :disabled="$v.$invalid || session.status === 'login'"
                @click="login"
            >{{$t('connect')}}</button>
        </div>
    </div>

    <!--Unlocking a selected session-->
    <div v-else-if="app.session.active && app.session.active !== 'new'">
        <FieldPassword
            v-model="password"
            elementclass="t-txt-session-pw"
            name="session-pw"
            :autofocus="true"
            :help="$t('password that opens vault {name}.', {name: app.session.active})"
            :label="$t('phone password')"
            :placeholder="$t('secret password')"
            :validation="$v.password"
        />

        <div class="buttons is-centered">
            <button class="button button--widget t-btn-login"
                v-if="app.session.available.length"
                :disabled="session.status === 'login'"
                @click="selectSession()"
            >{{$t('change session')}}</button>
            <button class="button button--widget primary t-btn-login"
                :class="{'is-loading': session.status === 'login'}"
                :disabled="$v.$invalid || session.status === 'login'"
                @click="login"
            >{{$t('unlock phone')}}</button>
        </div>
    </div>

    <!--List all available sessions-->
    <div v-else-if="app.session.available.length && !app.session.active" class="sessions">

        <div v-for="session in app.session.available" class="session">
            <button class="button--widget" @click="selectSession(session)">
                <icon class="btn-icon" name="phone"/>
                <div class="btn-description">{{session}}</div>
                <div class="btn-actions">
                    <i class="icon-remove tooltip tooltip-top" :data-tooltip="$t('remove session')" @click="removeSession(session)">
                        <icon name="delete"/>
                    </i>
                </div>
            </button>
        </div>

        <div class="session">
            <button class="session button--widget new-session" @click="newSession()">
                <icon class="btn-icon" name="phone-add"/>
                <div class="btn-description uc">{{$t('new phone')}}</div>
            </button>
        </div>
    </div>
</component>
