"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const core_1 = require("@react-sigma/core");
const lodash_1 = require("lodash");
const react_1 = require("react");
const GraphDataController = ({ dataset, filters, children, }) => {
    const sigma = (0, core_1.useSigma)();
    const graph = sigma.getGraph();
    (0, react_1.useEffect)(() => {
        if (!graph || !dataset)
            return;
        const clusters = (0, lodash_1.keyBy)(dataset.clusters, "key");
        const tags = (0, lodash_1.keyBy)(dataset.tags, "key");
        dataset.nodes.forEach((node) => graph.addNode(node.key, Object.assign(Object.assign(Object.assign({}, node), (0, lodash_1.omit)(clusters[node.cluster], "key")), { image: `./images/${tags[node.tag].image}` })));
        dataset.edges.forEach(([source, target]) => graph.addEdge(source, target, { size: 1 }));
        const scores = graph.nodes().map((node) => graph.getNodeAttribute(node, "score"));
        const minDegree = Math.min(...scores);
        const maxDegree = Math.max(...scores);
        const MIN_NODE_SIZE = 3;
        const MAX_NODE_SIZE = 30;
        graph.forEachNode((node) => {
            let size = ((graph.getNodeAttribute(node, "score") - minDegree) / (maxDegree - minDegree)) *
                (MAX_NODE_SIZE - MIN_NODE_SIZE) +
                MIN_NODE_SIZE;
            size = 15;
            graph.setNodeAttribute(node, "size", size);
        });
        return () => graph.clear();
    }, [graph, dataset]);
    (0, react_1.useEffect)(() => {
        const { clusters, tags } = filters;
        graph.forEachNode((node, { cluster, tag }) => graph.setNodeAttribute(node, "hidden", !clusters[cluster] || !tags[tag]));
    }, [graph, filters]);
    return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: children });
};
exports.default = GraphDataController;
//# sourceMappingURL=GraphDataController.js.map