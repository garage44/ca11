<component class="c-status-menu">


    <div class="c-status-menu__menu-side">


    </div>

        <div class="c-status-menu__menu">
        <!-- <div class="layer-topic">
            <icon :name="layer"/>
        </div> -->

        <!-- <button
            class="button button--menu c-status-menu__button tooltip tooltip-bottom"
            :class="{active: layer === 'about'}"
            :data-tooltip="$t('about {name}', {name: app.name})"
            @click="setLayer('about')"
        ><icon name="about"/></button> -->

            <button
            class="button button--menu c-status-menu__button tooltip tooltip-left"
            @click="logout"
            :data-tooltip="$t('quit')"
        >
            <icon name="logout"/>
        </button>

    </div>


</component>
