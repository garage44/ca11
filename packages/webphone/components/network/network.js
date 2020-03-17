export default (app) => {

    const Network = {
        beforeDestroy() {
            window.removeEventListener('resize', this.onResizeHandler)
        },
        computed: {
            bounds() {
                return {
                    maxX: Math.max(...this.nodes.map(n => n.x)) || this.width,
                    maxY: Math.max(...this.nodes.map(n => n.y)) || this.height,
                    minX: Math.min(...this.nodes.map(n => n.x)) || 0,
                    minY: Math.min(...this.nodes.map(n => n.y)) || 0,
                }
            },
            coords() {
                return this.nodes.map(node => {
                    return {
                        x: this.padding + (node.x - this.bounds.minX) * (this.width - 2 * this.padding) / (this.bounds.maxX - this.bounds.minX),
                        y: this.padding + (node.y - this.bounds.minY) * (this.height - 2 * this.padding) / (this.bounds.maxY - this.bounds.minY),
                    }
                })
            },
        },
        data: function() {
            return {
                height: 100,
                move: null,
                padding: 15,
                simulation: null,
                width: 100,
            }
        },
        methods: {
            classes(block, entity) {
                const classes = {}
                if (block === 'node') {
                    classes.headless = entity.headless
                    if (entity.id === this.identity.id) {
                        classes.own = true
                    }
                }
                return classes
            },
            drag(e) {
                if (this.move) {
                    this.move.node.fx = (
                        this.move.node.x - (this.move.x - e.screenX) *
                        (this.bounds.maxX - this.bounds.minX) / (this.width - 2 * this.padding)
                    )
                    this.move.node.fy = (
                        this.move.node.y - (this.move.y - e.screenY) *
                        (this.bounds.maxY - this.bounds.minY) / (this.height - 2 * this.padding)
                    )
                    this.move.x = e.screenX
                    this.move.y = e.screenY
                }
            },
            drop() {
                if (this.move) {
                    this.move.node.fx = null
                    this.move.node.fy = null
                    this.move = null
                    this.simulation.alpha(1).restart()
                }
            },
            fixHeadless() {
                // For now, just center the first headless node.
                this.node = this.nodes.find((n) => n.headless)
                if (this.node) {
                    this.node.fx = this.width / 2
                    this.node.fy = this.height / 2
                }
            },
            onResize() {
                this.width = this.$refs.container.clientWidth
                this.height = this.$refs.container.clientHeight
                this.fixHeadless()
            },
            toggleSelect: function(node) {
                // Only allow one selected node at a time for now.
                for (const _node of this.nodes) {
                    if (_node.id !== node.id) _node.selected = false
                    else {
                        _node.selected = !_node.selected
                        if (_node.selected) {
                            if (!_node.headless && _node.id !== this.identity.id) {
                                this.description.number = app.sig11.network.node(_node.id).number
                            } else {
                                this.description.number = null
                            }
                        } else this.description.number = null

                    }
                }
                navigator.vibrate(100)

            },
        },
        mounted: function() {
            this.onResizeHandler = this.onResize.bind(this)
            this.onResize()
            window.addEventListener('resize', this.onResizeHandler)
            this.simulate()
        },
        store: {
            description: 'caller.description',
            edges: 'sig11.network.edges',
            identity: 'sig11.identity',
            nodes: 'sig11.network.nodes',
        },
        watch: {
            edges: function() {
                this.simulation.nodes(this.nodes, this.edges)
                this.simulate()
            },
            nodes: function() {
                for (const node of this.nodes) {
                    if (node.super) {
                        node.fx = this.width / 2
                        node.fy = this.height / 2
                    }
                }

                this.simulation.nodes(this.nodes, this.edges)
                this.simulate()
            },
        },
    }

    return Network
}
