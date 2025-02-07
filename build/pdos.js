import { pdos, Core } from "@alpinehealthcare/pdos";
export const CLUSTERS = [
    { "key": "0", "color": "#6c3e81", "clusterLabel": "Treatments" },
    { "key": "1", "color": "#666666", "clusterLabel": "Access" },
    { "key": "2", "color": "#666666", "clusterLabel": "Data" }
];
export const TAGS = [
    { "key": "Treatment", "image": "method.svg" },
    { "key": "Access", "image": "person.svg" },
    { "key": "Data", "image": "tool.svg" }
];
export const startPDOS = async () => {
    new Core({
        env: "marigold",
        context: {
            gatewayURL: process.env.ALPINE_GATEWAY_URL ?? "",
        },
        modules: {
            auth: {},
            encryption: {
                enabled: true
            },
            storage: {}
        }
    });
    await pdos().start();
};
export const createNode = (node, x = 0, y = 0) => {
    let nodeType = node._nodeType;
    if (nodeType.includes("TreatmentBinary")) {
        nodeType = nodeType + node._hash;
    }
    return {
        URL: "",
        data: node,
        cluster: "1",
        key: nodeType,
        label: nodeType,
        score: 0.00006909602204225056,
        tag: "Access",
        x,
        y
    };
};
const usedLocations = {};
export const drawGraph = (root) => {
    const nodes = [];
    const edges = [];
    const cycleThroughTree = (node, x, y) => {
        if (usedLocations[x] && usedLocations[y]) {
            x = x + 200;
        }
        console.log("node: ", node);
        if (!node) {
            return;
        }
        nodes.push(createNode(node, x, y));
        usedLocations[x] = true;
        usedLocations[y] = true;
        const children = node.getChildren();
        let newY = y - 200;
        for (let i = 0; i < children.length; i++) {
            let nodeType = node._nodeType;
            let childType = children[i]._nodeType;
            if (nodeType.includes("TreatmentBinary")) {
                nodeType = nodeType + node._hash;
            }
            if (childType.includes("TreatmentBinary")) {
                childType = childType + children[i]._hash;
            }
            edges.push([nodeType, childType]);
            console.log("calling child: ", children[i]._nodeType, x - (i * 200), newY);
            cycleThroughTree(children[i], x - (i * 200), newY);
        }
    };
    cycleThroughTree(root, 0, 0);
    return {
        nodes,
        edges
    };
};
export const drawGraph2 = (root) => {
    const nodes = [];
    const edges = [];
    const calculateSubtreeSizes = (node) => {
        const children = node.getChildren();
        if (!children || children.length === 0) {
            return 1;
        }
        return children.reduce((sum, child) => sum + calculateSubtreeSizes(child), 0);
    };
    const layoutTree = (node, x, y, offset) => {
        nodes.push(createNode(node, x, y));
        const children = node.getChildren();
        const nodeType = node._nodeType.includes("TreatmentBinary")
            ? node._nodeType + node._hash
            : node._nodeType;
        if (children && children.length > 0) {
            let childX = x - offset;
            const childOffset = offset / children.length;
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                const childType = child._nodeType.includes("TreatmentBinary")
                    ? child._nodeType + child._hash
                    : child._nodeType;
                edges.push([nodeType, childType]);
                layoutTree(child, childX, y - 100, childOffset);
                childX += childOffset * 2;
            }
        }
    };
    const treeWidth = calculateSubtreeSizes(root) * 100;
    layoutTree(root, 0, 0, treeWidth / 2);
    return {
        nodes,
        edges,
    };
};
export const getTreeGraphSnapshot = () => {
    const root = pdos().tree.userAccount;
    const graph = drawGraph2(root);
    return graph;
};
//# sourceMappingURL=pdos.js.map