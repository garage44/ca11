
<component class="c-network">
    <div ref="container" class="svg-container">
        <svg
            :viewBox="`0 0 ${width} ${height}`"
            @mousemove="drag($event)"
            @mouseup="drop()"
            xmlns="http://www.w3.org/2000/svg"
        >
            <text
                :x="`${width - 12}`"
                class="node-id"
                v-for="(node, i) in nodes"
                v-if="node.selected"
                writing-mode="tb"
                y="8"
            >{{node.id}}</text>

            <line
                :x1="coords[edge.source.index].x"
                :x2="coords[edge.target.index].x"
                :y1="coords[edge.source.index].y"
                :y2="coords[edge.target.index].y"
                v-for="edge in edges"
            />

            <circle
                v-for="(node, i) in nodes"
                :key="node.id"
                class="node"
                :class="{headless: node.headless, own: node.id === identity.id, selected: node.selected}"
                :cx="coords[i].x"
                :cy="coords[i].y"
                :r="5"
                @click="toggleSelect(node)"
                @mousedown="move = {x: $event.screenX, y: $event.screenY, node}"
            />
        </svg>
    </div>
</component>
