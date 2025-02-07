import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useSetSettings, useSigma } from "@react-sigma/core";
import { useEffect } from "react";
import { drawHover, drawLabel } from "../canvas-utils";
import useDebounce from "../use-debounce";
const NODE_FADE_COLOR = "#bbb";
const EDGE_FADE_COLOR = "#eee";
const GraphSettingsController = ({ children, hoveredNode }) => {
    const sigma = useSigma();
    const setSettings = useSetSettings();
    const graph = sigma.getGraph();
    const debouncedHoveredNode = useDebounce(hoveredNode, 40);
    useEffect(() => {
        const hoveredColor = (debouncedHoveredNode && sigma.getNodeDisplayData(debouncedHoveredNode)?.color) || "";
        setSettings({
            defaultDrawNodeLabel: drawLabel,
            defaultDrawNodeHover: drawHover,
            nodeReducer: (node, data) => {
                if (debouncedHoveredNode) {
                    return node === debouncedHoveredNode ||
                        graph.hasEdge(node, debouncedHoveredNode) ||
                        graph.hasEdge(debouncedHoveredNode, node)
                        ? { ...data, zIndex: 1 }
                        : { ...data, zIndex: 0, label: "", color: NODE_FADE_COLOR, image: null, highlighted: false };
                }
                return data;
            },
            edgeReducer: (edge, data) => {
                if (debouncedHoveredNode) {
                    return graph.hasExtremity(edge, debouncedHoveredNode)
                        ? { ...data, color: hoveredColor, size: 4 }
                        : { ...data, color: EDGE_FADE_COLOR, hidden: true };
                }
                return data;
            },
        });
    }, [sigma, graph, debouncedHoveredNode]);
    useEffect(() => {
        const hoveredColor = (debouncedHoveredNode && sigma.getNodeDisplayData(debouncedHoveredNode)?.color) || "";
        sigma.setSetting("nodeReducer", debouncedHoveredNode
            ? (node, data) => node === debouncedHoveredNode ||
                graph.hasEdge(node, debouncedHoveredNode) ||
                graph.hasEdge(debouncedHoveredNode, node)
                ? { ...data, zIndex: 1 }
                : { ...data, zIndex: 0, label: "", color: NODE_FADE_COLOR, image: null, highlighted: false }
            : null);
        sigma.setSetting("edgeReducer", debouncedHoveredNode
            ? (edge, data) => graph.hasExtremity(edge, debouncedHoveredNode)
                ? { ...data, color: hoveredColor, size: 4 }
                : { ...data, color: EDGE_FADE_COLOR, hidden: true }
            : null);
    }, [debouncedHoveredNode]);
    return _jsx(_Fragment, { children: children });
};
export default GraphSettingsController;
//# sourceMappingURL=GraphSettingsController.js.map