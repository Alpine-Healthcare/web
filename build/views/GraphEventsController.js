import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useRegisterEvents, useSigma } from "@react-sigma/core";
import { useEffect, useState } from "react";
function getMouseLayer() {
    return document.querySelector(".sigma-mouse");
}
const GraphEventsController = ({ setHoveredNode, children, }) => {
    const sigma = useSigma();
    const graph = sigma.getGraph();
    const registerEvents = useRegisterEvents();
    const [showNodeData, setShowNodeData] = useState(false);
    const [nodeData, setNodeData] = useState(null);
    useEffect(() => {
        registerEvents({
            clickNode(data) {
                const { node } = data;
                const graphNode = graph.getNodeAttributes(node);
                delete graphNode.data["core"];
                setNodeData(graphNode.data.getData());
                setShowNodeData(false);
                setHoveredNode(graphNode.data.getData());
            },
            enterNode({ node }) {
                setHoveredNode(node);
                const mouseLayer = getMouseLayer();
                if (mouseLayer)
                    mouseLayer.classList.add("mouse-pointer");
            },
            leaveNode() {
                const mouseLayer = getMouseLayer();
                if (mouseLayer)
                    mouseLayer.classList.remove("mouse-pointer");
            },
        });
    }, []);
    return _jsxs(_Fragment, { children: [showNodeData ? (_jsx("div", { className: "panel", style: { position: 'absolute', bottom: 0, right: 10, height: "500px", width: "300px" }, children: _jsx("p", { children: JSON.stringify(nodeData) }) })) : null, children] });
};
export default GraphEventsController;
//# sourceMappingURL=GraphEventsController.js.map