<component class="c-sidebar">
    <header class="header">
        <div class="header__logo">

            <router-link to="/">
                <icon name="logo-o"/>
                <div class="header__title">CA11</div>
                <div class="header__description">
                    <transition name="slogan" appear>
                        <div v-if="slogans[currentSlogan].show" :key="slogans[currentSlogan].id">{{slogans[currentSlogan].phrase}}</div>
                    </transition>
                </div>
            </router-link>
        </div>



        <div class="header__version">{{version.current}}</div>

    </header>
    <nav class="navigation">
        <div class="l-accordion navigation__user">
            <input id="accordion-1" name="accordion" type="radio" :checked="isSection('users')"/>
            <label class="navigation__header" for="accordion-1">
                <icon name="user"/><span>CA11 for Users</span>
            </label>
            <section class="accordion">
                <router-link
                    v-for="(topic, name) in topics.user"
                    class="btn  navigation__button"
                    :to="{name: 'users', params: {topic_id: topic.name}}"
                ><icon :name="topic.icon"/><span>{{topic.title}}</span></router-link>
            </section>
        </div>

        <div class="l-accordion navigation__developer">
            <input id="accordion-2" name="accordion" type="radio" :checked="isSection('developers')"/>
            <label class="navigation__header" for="accordion-2">
                <icon name="developer"/><span>CA11 for Developers</span>
            </label>

            <section class="accordion">
                <router-link
                    class="btn  navigation__button"
                    :to="{name: 'developers', params: {topic_id: topic.name}}"
                    v-for="(topic, name) in topics.developer"
                ><icon :name="topic.icon"/><span>{{topic.title}}</span></router-link>
            </section>
        </div>
    </nav>
</component>
