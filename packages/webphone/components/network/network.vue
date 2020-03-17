
<component class="c-network">
    <div class="svg-container" ref="container">
        <svg xmlns="http://www.w3.org/2000/svg"
            @mousemove="drag($event)"
            @mouseup="drop()"
            :viewBox="`0 0 ${width} ${height}`"
        >
            <text
                v-if="node.selected"
                v-for="(node, i) in nodes"
                writing-mode="tb"
                :x="`${width - 12}`"
                y="8"
                class="node-id"
            >{{node.id}}</text>

            <line v-for="edge in edges"
                :x1="coords[edge.source.index].x"
                :y1="coords[edge.source.index].y"
                :x2="coords[edge.target.index].x"
                :y2="coords[edge.target.index].y"
            />

            <circle
                v-for="(node, i) in nodes"
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
