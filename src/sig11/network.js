const graphlib = require('graphlib')

const Protocol = require('./protocol')
const D3 = require('./d3')


class Network {

    constructor(app) {
        this.app = app
        this.protocol = new Protocol(this)

        // Reactive d3'ified graphlib.
        if (app.env.isBrowser) {
            this.d3 = new D3(this.app)
        }

        this.graph = new graphlib.Graph({directed: false})
        // Nodes with a transport.
        this.endpoints = new Map()
    }


    addEndpoint(endpoint, parent = null) {
        this.app.logger.debug(`${this}endpoint added ${endpoint.id.sid()}`)
        this.endpoints.set(endpoint.id, endpoint)
        this.addNode(endpoint.serialize(), parent)
    }


    addNode(node, parent = null) {
        this.graph.setNode(node.id, node)
        if (parent) this.graph.setEdge(parent.id, node.id)
        this.app.logger.debug(`${this}node added ${node.id.sid()} (${this.graph.nodes().length})`)
        if (this.d3) this.d3.addNode(node, parent)
    }


    broadcast(msg, {excludes = []} = {}) {
        for (const endpoint of this.endpoints.values()) {
            if (excludes.length && excludes.includes(endpoint)) continue
            endpoint.send(msg)
        }
    }


    clear() {
        this.app.logger.debug(`${this}clear graph`)
        for (const nodeId of this.graph.nodes()) {
            this.removeNode(nodeId)
        }
    }


    export() {
        const exportGraph = graphlib.json.write(this.graph)

        return {
            edges: exportGraph.edges,
            identity: this.identity,
            nodes: exportGraph.nodes,
        }
    }


    filterNode({number}) {
        let results = []
        for (const nodeId of this.graph.nodes()) {
            const node = this.node(nodeId)
            if (node.number === number) results.push(node)
        }
        return results
    }


    import({edges, nodes}) {
        this.app.logger.info(`${this}import network`)
        for (const node of nodes) {
            if (!this.graph.node(node.v)) {
                this.graph.setNode(node.v, node.value)
            }
        }

        for (const edge of edges) {
            if (!this.graph.edge(edge.v, edge.w)) {
                this.graph.setEdge(edge.v, edge.w)
            }
        }

        if (this.d3) {
            this.app.setState({sig11: {network: this.d3.graph(this.graph)}})
        }
    }


    /**
     * Find a Node in the graph by it's id and return it. When
     * node is already a Node instance, it will return with the Node.
     * @param {Node} node - A node id or a {@link Node}.
     * @returns {Node} - A Node instance or a serializable Node representation.
     */
    node(node) {
        let match = null

        if (typeof node === 'string') {
            match = this.graph.node(node)
        } else match = this.graph.node(node.id)
        return match
    }


    removeEndpoint(endpoint) {
        this.endpoints.delete(endpoint.id)
        if (endpoint.id) this.app.logger.debug(`${this}endpoint removed ${endpoint.id.sid()}`)
        this.removeNode(endpoint.id)
    }


    removeNode(nodeId) {
        if (this.d3) this.d3.removeNode(nodeId)

        for (const edge of this.graph.edges()) {
            if (edge.v === nodeId || edge.w === nodeId) {
                this.graph.removeEdge(edge)
            }
        }

        this.graph.removeNode(nodeId)

        if (nodeId) {
            this.app.logger.debug(`${this}node removed ${nodeId.sid()} (${this.graph.nodes().length})`)
        }

    }


    async setIdentity(keypair) {
        this.clear()
        this.keypair = keypair
        this.identity = await this.app.crypto.serializeIdentity(keypair)

        this.app.logger.info(`${this}peer identity on network: ${this.identity.id.sid()}`)
        this.graph.setNode(this.identity.id, this.identity)
        return this.identity
    }


    /**
    * Generate a representational name for this module.
    * @returns {String} - An identifier for this module.
    */
    toString() {
        return `${this.app}[net] `
    }

}

module.exports = Network
