<component class="c-wizard wizard__step t-wizard" v-bind:is="steps.selected.name">
    <div class="c-wizard__progress" slot="progress">
        <div
            v-for="_step in steps.options"
            class="c-wizard__progress-step"
            :class="{active: _step.name === steps.selected.name}"
        />
    </div>
</component>
