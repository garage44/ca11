<component class="c-telemetry t-telemetry">
    <header class="c-wizard__header">{{$t('quality metrics')}}</header>

    <div class="c-wizard__description">
        {{$t('do you mind if {name} sends any application exceptions to a service for quality metrics?', {name: app.name}).ca()}}
        {{$t('this helps us to improve {name} and to respond faster to potential issues.', {name: app.name}).ca()}}

        <div class="tip">
            <a target="_blank" href="https://sentry.io/">
                <icon name="school"/> {{$t('more about').ca()}} {{$t('quality metrics')}}
            </a>
        </div>

        <div class="c-wizard__help">
            {{$t('you can also change your decision later from Settings.').ca()}}
        </div>
    </div>

    <slot name="progress"></slot>

    <div class="buttons stretched">
        <button class="button button--widget t-btn-telemetry-back" @click="stepBack()">
            {{$t('back')}}
        </button>

        <button
            class="button button--widget t-btn-telemetry-next-no"
            @click="toggleTelemetry(false)"
        >{{$t('block')}}</button>

        <button
            class="button button--widget primary t-btn-telemetry-next-yes"
            @click="toggleTelemetry(true)"
        >{{$t('allow')}}</button>

    </div>
</component>
