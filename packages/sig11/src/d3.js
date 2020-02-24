/**
 * Helper class to convert between graphlib
 * and D3's graph format and to adjust state.
 */
class D3 {
    constructor(app) {
        this.app = app
    }


    addNode(node, parent) {
        const {edges, nodes} = this.app.state.sig11.network

        node = this.node(node)
        nodes.push(node)
        if (parent) {
            parent = nodes.find((i) => i.id === parent.id)
            if (parent) {
                edges.push({
                    source: {
                        index: nodes.indexOf(node),
                    },
                    target: {
                        index: nodes.indexOf(parent),
                    },
                })
            }
        }
    }


    /**
     * Translate to a d3 graph representation.
     * @param {Graph} graph - A graphlib Graph.
     * @returns {Object} - Nodes and Edges in d3 format.
     */
    graph(graph) {
        const nodeIds = graph.nodes()
        const nodes = graph.nodes().map((i) => {
            const value = graph.node(i)
            return this.node(value)
        })

        const edges = graph.edges().map((i) => {
            return {
                source: {index: nodeIds.indexOf(i.v)},
                target: {index: nodeIds.indexOf(i.w)},
            }
        })

        return {edges, nodes}
    }


    node(value) {
        return {
            fx: null, fy: null,
            headless: value.headless,
            id: value.id,
            selected: false,
            x: 0, y: 0,
        }
    }


    /**
     * The network is kept in state in d3 format, because d3-force
     * is used to represent the network layout. This is only used
     * on the CA11 side.
     * @param {*} nodeId - The node id.
     */
    removeNode(nodeId) {
        const {edges, nodes} = this.app.state.sig11.network
        const nodeIndex = nodes.findIndex((i) => i.id === nodeId)
        // First delete all edges to/from this node.
        for (const [edgeIndex, edge] of edges.entries()) {
            if (edge.source.index === nodeIndex || edge.target.index === nodeIndex) {
                edges.splice(edgeIndex, 1)
            }
        }

        // Then update affected edges pointing to an outdated node index.
        if (edges.length) {
            for (let i = nodeIndex + 1; i < nodes.length; i++) {
                for (const edge of edges) {
                    if (edge.source.index === i || edge.target.index === i) {
                        edge.source.index -= 1
                        edge.target.index -= 1
                    }

                }
            }
        }
        nodes.splice(nodeIndex, 1)
    }
}

export default D3
