import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useSigma } from "@react-sigma/core";
import { keyBy, mapValues, sortBy, values } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
import { MdGroupWork } from "react-icons/md";
import Panel from "./Panel";
const ClustersPanel = ({ clusters, filters, toggleCluster, setClusters }) => {
    const sigma = useSigma();
    const graph = sigma.getGraph();
    const nodesPerCluster = useMemo(() => {
        const index = {};
        graph.forEachNode((_, { cluster }) => (index[cluster] = (index[cluster] || 0) + 1));
        return index;
    }, []);
    const maxNodesPerCluster = useMemo(() => Math.max(...values(nodesPerCluster)), [nodesPerCluster]);
    const visibleClustersCount = useMemo(() => Object.keys(filters.clusters).length, [filters]);
    const [visibleNodesPerCluster, setVisibleNodesPerCluster] = useState(nodesPerCluster);
    useEffect(() => {
        requestAnimationFrame(() => {
            const index = {};
            graph.forEachNode((_, { cluster, hidden }) => !hidden && (index[cluster] = (index[cluster] || 0) + 1));
            setVisibleNodesPerCluster(index);
        });
    }, [filters]);
    const sortedClusters = useMemo(() => sortBy(clusters, (cluster) => -nodesPerCluster[cluster.key]), [clusters, nodesPerCluster]);
    return (_jsxs(Panel, { initiallyDeployed: true, title: _jsxs(_Fragment, { children: [_jsx(MdGroupWork, { className: "text-muted" }), " Clusters", visibleClustersCount < clusters.length ? (_jsxs("span", { className: "text-muted text-small", children: [" ", "(", visibleClustersCount, " / ", clusters.length, ")"] })) : ("")] }), children: [_jsx("p", { children: _jsx("i", { className: "text-muted", children: "Click a cluster to show/hide related pages from the network." }) }), _jsxs("p", { className: "buttons", children: [_jsxs("button", { className: "btn", onClick: () => setClusters(mapValues(keyBy(clusters, "key"), () => true)), children: [_jsx(AiOutlineCheckCircle, {}), " Check all"] }), " ", _jsxs("button", { className: "btn", onClick: () => setClusters({}), children: [_jsx(AiOutlineCloseCircle, {}), " Uncheck all"] })] }), _jsx("ul", { children: sortedClusters.map((cluster) => {
                    const nodesCount = nodesPerCluster[cluster.key];
                    const visibleNodesCount = visibleNodesPerCluster[cluster.key] || 0;
                    return (_jsxs("li", { className: "caption-row", title: `${nodesCount} page${nodesCount > 1 ? "s" : ""}${visibleNodesCount !== nodesCount ? ` (only ${visibleNodesCount} visible)` : ""}`, children: [_jsx("input", { type: "checkbox", checked: filters.clusters[cluster.key] || false, onChange: () => toggleCluster(cluster.key), id: `cluster-${cluster.key}` }), _jsxs("label", { htmlFor: `cluster-${cluster.key}`, children: [_jsx("span", { className: "circle", style: { background: cluster.color, borderColor: cluster.color } }), " ", _jsxs("div", { className: "node-label", children: [_jsx("span", { children: cluster.clusterLabel }), _jsx("div", { className: "bar", style: { width: (100 * nodesCount) / maxNodesPerCluster + "%" }, children: _jsx("div", { className: "inside-bar", style: {
                                                        width: (100 * visibleNodesCount) / nodesCount + "%",
                                                    } }) })] })] })] }, cluster.key));
                }) })] }));
};
export default ClustersPanel;
//# sourceMappingURL=ClustersPanel.js.map