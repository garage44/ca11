<component class="c-transfer">
    <div class="c-transfer__text">
        {{$t('transfer this call to')}}:
    </div>
    <Lobby
        :model.sync="description.number"
        :number="description.number"
        mode="call"
    />

    <div class="c-transfer__options">
        <button
            class="btn  c-transfer__button t-btn-transfer-attended"
            :class="classes('attended-button')"
            @click="transferMode('attended')"
        >
            {{ $t('attended transfer') }}
        </button>

        <button
            class="btn  c-transfer__button t-btn-transfer-blind"
            :class="classes('blind-button')"
            @click="transferMode('blind')"
        >
            {{ $t('blind transfer') }}
        </button>
    </div>

    <ol v-if="call.transfer.type === 'attended'" class="c-transfer__instruction">
        <li>
            {{ $t('starts a new call with {number}', {number: description.number ? description.number : '...'}) }}
        </li>

        <li class="action">
            {{ $t('consult with {number} about this caller', {
                number: description.number ? description.number : '...'
            }) }}
        </li>
        <li class="action">
            {{ $t('finalize transfer') }}
        </li>
        <li>
            {{ $t('connects {target} with {number}', {
                number: description.number ? description.number : '...',
                target: call.number,
            }) }}
        </li>
        <li>{{ $t('connection ends') }}</li>
    </ol>

    <ol v-else-if="call.transfer.type === 'blind'" class="c-transfer__instruction">
        <li>
            {{ $t('connects {number} with {target}', {
                number: call.number,
                target: description.number ? description.number : '...'
            }) }}
        </li>
        <li>{{ $t('connection ends') }}</li>
        <li>{{ $t('no caller pickup verification') }}</li>
    </ol>
</component>
