<component class="c-transfer">
    <div class="c-transfer__text">
        {{$t('transfer this call to')}}:
    </div>
    <Dialer
        mode="call"
        :number="description.number"
        :model.sync="description.number"
    />

    <div class="c-transfer__options">
        <button
            class="button c-transfer__button t-btn-transfer-attended"
            :class="classes('attended-button')"
            @click="transferMode('attended')"
        >{{$t('attended transfer')}}</button>

        <button
            class="button c-transfer__button t-btn-transfer-blind"
            :class="classes('blind-button')"
            @click="transferMode('blind')"
        >{{$t('blind transfer')}}</button>
    </div>

    <ol class="c-transfer__instruction" v-if="call.transfer.type === 'attended'">
        <li>
            {{$t('starts a new call with {number}', {number: description.number ? description.number : '...'})}}
        </li>

        <li class="action">{{$t('consult with {number} about this caller', {
            number: description.number ? description.number : '...'
            })}}
        </li>
        <li class="action">{{$t('finalize transfer')}}</li>
        <li>{{$t('connects {target} with {number}', {
            number: description.number ? description.number : '...',
            target: call.number,
        })}}</li>
        <li>{{$t('connection ends')}}</li>
    </ol>

    <ol class="c-transfer__instruction" v-else-if="call.transfer.type === 'blind'">
        <li>
            {{$t('connects {number} with {target}', {
                number: call.number,
                target: description.number ? description.number : '...'
            })}}
        </li>
        <li>{{$t('connection ends')}}</li>
        <li>{{$t('no caller pickup verification')}}</li>
    </ol>
</component>
