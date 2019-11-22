<section
    class="c-session t-login"
    component
    tabindex="-1"
    v-on:keyup.enter="login"
>

    <div class="resources">
    <a target="_blank" href="https://blog.ca11.app">
    <button class="button button--widget">NEWS</button></a>
    </div>


    <header>
        <a target="_blank" href="https://docs.ca11.io">
            <icon name="caller" class="c-session__logo"/>

        </a>

        <div class="c-session__slogan">
            <transition name="slogan" appear>
                <div v-if="slogans[currentSlogan].show" :key="slogans[currentSlogan].id">{{slogans[currentSlogan].phrase}}</div>
            </transition>
        </div>
    </header>

    <!-- Login when there are no sessions or when starting a new session-->
    <div
        v-if="!app.session.available.length || app.session.active === 'new' || session.status === 'login'">

        <FieldText
            v-model="sig11.identity.number"
            elementclass="t-txt-sig11-number"
            name="sig11_number"
            :help="$t('the number (or name) that people may call you on.')"
            :label="$t('choose a CA11 number')"
            :validation="$v.sig11.identity.number"
        />

        <FieldPassword
            v-model="password"
            elementclass="t-txt-session-pw"
            name="session-pw"
            :autofocus="true"
            :help="$t('used to encrypt persistent phone data with.')"
            :label="$t('password protection')"
            :validation="$v.password"
        />

        <FieldCheckbox
            v-model="wizard.completed"
            name="store_key"
            :help="$t('use default devices, no telemetrics and no Click-To-Dial.')"
            :label="$t('skip wizard')"
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
        <FieldText
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
            <button
                v-if="app.session.available.length"
                class="button button--widget t-btn-login"
                :disabled="session.status === 'login'"
                @click="selectSession()"
            >{{$t('change session')}}</button>
            <button
                class="button button--widget primary t-btn-login"
                :class="{'is-loading': session.status === 'login'}"
                :disabled="$v.$invalid || session.status === 'login'"
                @click="login"
            >{{$t('unlock phone')}}</button>
        </div>
    </div>

    <!--List all available sessions-->
    <div
        v-else-if="app.session.available.length && !app.session.active"
        class="sessions"
    >

        <div v-for="session in app.session.available" class="session">
            <i class="icon-session" @click="selectSession(session)"><icon name="phone"/></i>
            <div class="session__description" @click="selectSession(session)">{{session}}</div>
            <i class="icon-remove status-indicator tooltip tooltip-left" :data-tooltip="$t('remove session')" @click="removeSession(session)">
                <icon name="delete"/>
            </i>
        </div>

        <div class="session new-session" @click="newSession()">
            <i class="icon-session">
                <icon class="icon-session" name="phone-add"/>
            </i>
            <div class="session__description cf">
                {{$t('new phone')}}
            </div>
        </div>
    </div>


</section>
