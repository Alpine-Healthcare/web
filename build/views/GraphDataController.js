import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useSigma } from "@react-sigma/core";
import { keyBy, omit } from "lodash";
import { useEffect } from "react";
const GraphDataController = ({ dataset, filters, children, }) => {
    const sigma = useSigma();
    const graph = sigma.getGraph();
    useEffect(() => {
        if (!graph || !dataset)
            return;
        const clusters = keyBy(dataset.clusters, "key");
        const tags = keyBy(dataset.tags, "key");
        dataset.nodes.forEach((node) => graph.addNode(node.key, {
            ...node,
            ...omit(clusters[node.cluster], "key"),
            image: `./images/${tags[node.tag].image}`,
        }));
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
    useEffect(() => {
        const { clusters, tags } = filters;
        graph.forEachNode((node, { cluster, tag }) => graph.setNodeAttribute(node, "hidden", !clusters[cluster] || !tags[tag]));
    }, [graph, filters]);
    return _jsx(_Fragment, { children: children });
};
export default GraphDataController;
//# sourceMappingURL=GraphDataController.js.map