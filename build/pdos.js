"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTreeGraphSnapshot = exports.drawGraph2 = exports.drawGraph = exports.createNode = exports.startPDOS = exports.TAGS = exports.CLUSTERS = void 0;
const tslib_1 = require("tslib");
const pdos_1 = tslib_1.__importStar(require("@alpinehealthcare/pdos"));
exports.CLUSTERS = [
    { "key": "0", "color": "#6c3e81", "clusterLabel": "Treatments" },
    { "key": "1", "color": "#666666", "clusterLabel": "Access" },
    { "key": "2", "color": "#666666", "clusterLabel": "Data" }
];
exports.TAGS = [
    { "key": "Treatment", "image": "method.svg" },
    { "key": "Access", "image": "person.svg" },
    { "key": "Data", "image": "tool.svg" }
];
const wallet_sdk_1 = require("@coinbase/wallet-sdk");
const sdk = (0, wallet_sdk_1.createCoinbaseWalletSDK)({
    appName: "Alpine Healthcare",
    appLogoUrl: "https://alpine.healthcare/favicon.ico",
    appChainIds: [84532],
    preference: {
        options: "all",
        attribution: {
            auto: true,
        }
    },
});
const startPDOS = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    new pdos_1.Core({
        env: "sepolia",
        context: {
            gatewayURL: process.env.ALPINE_GATEWAY_URL,
        },
        modules: {
            auth: {
                eip1193Provider: sdk.getProvider()
            },
        }
    });
    yield (0, pdos_1.default)().start();
});
exports.startPDOS = startPDOS;
const createNode = (node, x = 0, y = 0) => {
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
exports.createNode = createNode;
const usedLocations = {};
const drawGraph = (root) => {
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
        nodes.push((0, exports.createNode)(node, x, y));
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
exports.drawGraph = drawGraph;
const drawGraph2 = (root) => {
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
        nodes.push((0, exports.createNode)(node, x, y));
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
exports.drawGraph2 = drawGraph2;
const getTreeGraphSnapshot = () => {
    const root = (0, pdos_1.default)().tree.userAccount;
    const graph = (0, exports.drawGraph2)(root);
    return graph;
};
exports.getTreeGraphSnapshot = getTreeGraphSnapshot;
//# sourceMappingURL=pdos.js.map