<section component class="c-about content-wide">

    <header class="content__header header">
         <div class="header__filters"></div>
         <div class="header__text">{{app.name}} {{app.version.current}}</div>
         <div class="header__actions"></div>
    </header>

    <main class="about main">
        <div class="support-l">

            <div
                class="support-item"
                @click="openTab(vendor.support.website)"
            >
                <div class="support-item__icon"><icon name="about"/></div>
                <div class="support-item-l">
                    <div class="support-item__title cf">{{$t('need help?')}}</div>
                    <div class="support-item__description cf">
                        {{$t('the documentation is here to help you make the most out of CA11')}}!
                    </div>
                  </div>
            </div>

            <div
                v-if="vendor.support.email"
                class="support-item"
                @click="openTab('mailto:' + vendor.support.email)"
            >
                <div class="support-item__icon"><icon name="mail"/></div>
                <div class="support-item-l">
                    <div class="support-item__title cf">{{$t('questions')}}?</div>
                    <div class="support-item__description cf">
                        {{$t('feel free to contact us for feedback or questions about {vendor} or related products', {vendor: app.name})}}.
                    </div>
                </div>
            </div>

            <div
                v-if="vendor.support.phone"
                class="support-item"
            >
                <div class="support-item__icon"><icon name="phone"/></div>
                <div class="support-item-l">
                    <div class="support-item__title cf">{{$t('phone')}}</div>
                    <div class="support-item__description cf">{{$t('give us a call')}}:</div>
                    <div class="support-item__channel">{{vendor.support.phone}}</div>
                </div>
            </div>

        </div>
    </main>
</section>
