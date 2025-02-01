"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const core_1 = require("@react-sigma/core");
const react_1 = require("react");
function getMouseLayer() {
    return document.querySelector(".sigma-mouse");
}
const GraphEventsController = ({ setHoveredNode, children, }) => {
    const sigma = (0, core_1.useSigma)();
    const graph = sigma.getGraph();
    const registerEvents = (0, core_1.useRegisterEvents)();
    const [showNodeData, setShowNodeData] = (0, react_1.useState)(false);
    const [nodeData, setNodeData] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
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
    return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [showNodeData ? ((0, jsx_runtime_1.jsx)("div", { className: "panel", style: { position: 'absolute', bottom: 0, right: 10, height: "500px", width: "300px" }, children: (0, jsx_runtime_1.jsx)("p", { children: JSON.stringify(nodeData) }) })) : null, children] });
};
exports.default = GraphEventsController;
//# sourceMappingURL=GraphEventsController.js.map