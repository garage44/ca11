
<component
    :class="classes()"
    @click="$emit('click', $event)"
    class="c-stream"
>
    <icon :name="stream.kind" class="stream-icon" v-if="stream.ready" />
    <icon v-else class="spinner stream-icon" name="spinner" />

    <panel>
        <div class="actions">
            <button
                v-if="stream.kind !== 'audio'"
                class="action button btn-menu"
                :class="{'active': editMode}"
                @click.stop="toggleFullscreen()"
            >
                <icon name="fullscreen" />
            </button>


            <!-- <icon
                v-if="stream.kind !== 'audio'" :class="{active: recording}"
                name="pip"
                @click.stop="togglePip()"
            />
            <icon :class="{active: recording}" name="record-rec" @click.stop="toggleRecord()" />
            <icon v-if="stream.local" :name="stream.kind" @click.stop="switchStream()" /> -->
        </div>
    </panel>

    <content>
        <audio
            v-show="stream.id && stream.kind === 'audio'"
            ref="audio"
            autoplay="true"
            muted="true"
        />

        <video
            v-show="stream.id && stream.kind === 'video'"
            ref="video"
            autoplay="true"
            :muted="stream.muted"
        />

        <video
            v-show="stream.id && stream.kind === 'display'"
            ref="display"
            autoplay="true"
            :muted="stream.muted"
        />
    </content>
</component>
