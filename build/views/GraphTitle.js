import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSigma } from "@react-sigma/core";
import { useEffect, useState } from "react";
function prettyPercentage(val) {
    return (val * 100).toFixed(1) + "%";
}
const GraphTitle = ({ filters }) => {
    const sigma = useSigma();
    const graph = sigma.getGraph();
    const [visibleItems, setVisibleItems] = useState({ nodes: 0, edges: 0 });
    useEffect(() => {
        requestAnimationFrame(() => {
            const index = { nodes: 0, edges: 0 };
            graph.forEachNode((_, { hidden }) => !hidden && index.nodes++);
            graph.forEachEdge((_, _2, _3, _4, source, target) => !source.hidden && !target.hidden && index.edges++);
            setVisibleItems(index);
        });
    }, [filters]);
    return (_jsxs("div", { className: "graph-title", children: [_jsx("h1", { children: "A cartography of Wikipedia pages around data visualization" }), _jsx("h2", { children: _jsxs("i", { children: [graph.order, " node", graph.order > 1 ? "s" : "", " ", visibleItems.nodes !== graph.order
                            ? ` (only ${prettyPercentage(visibleItems.nodes / graph.order)} visible)`
                            : "", ", ", graph.size, " edge", graph.size > 1 ? "s" : "", " ", visibleItems.edges !== graph.size
                            ? ` (only ${prettyPercentage(visibleItems.edges / graph.size)} visible)`
                            : ""] }) })] }));
};
export default GraphTitle;
//# sourceMappingURL=GraphTitle.js.map