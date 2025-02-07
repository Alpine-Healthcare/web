"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const core_1 = require("@react-sigma/core");
const node_image_1 = require("@sigma/node-image");
const graphology_1 = require("graphology");
const lodash_1 = require("lodash");
const react_1 = require("react");
const bi_1 = require("react-icons/bi");
const bs_1 = require("react-icons/bs");
const gr_1 = require("react-icons/gr");
const canvas_utils_1 = require("../canvas-utils");
const GraphDataController_1 = tslib_1.__importDefault(require("./GraphDataController"));
const GraphEventsController_1 = tslib_1.__importDefault(require("./GraphEventsController"));
const mountains_webp_1 = tslib_1.__importDefault(require("../images/mountains.webp"));
const logo_png_1 = tslib_1.__importDefault(require("../images/logo.png"));
const pdos_1 = tslib_1.__importDefault(require("@alpinehealthcare/pdos"));
const pdos_2 = require("../pdos");
const pdos_3 = require("../pdos");
const pdos_4 = require("../pdos");
const Panel_1 = tslib_1.__importDefault(require("./Panel"));
const react_json_view_1 = tslib_1.__importDefault(require("react-json-view"));
const Account_1 = tslib_1.__importDefault(require("./Account"));
const mobx_react_lite_1 = require("mobx-react-lite");
(0, pdos_2.startPDOS)();
const Root = (0, mobx_react_lite_1.observer)(function Root() {
    var _a, _b, _c, _d, _e, _f;
    const [showContents, setShowContents] = (0, react_1.useState)(false);
    const [dataReady, setDataReady] = (0, react_1.useState)(false);
    const [dataset, setDataset] = (0, react_1.useState)(null);
    const [filtersState, setFiltersState] = (0, react_1.useState)({
        clusters: {},
        tags: {},
    });
    const [hoveredNode, setHoveredNode] = (0, react_1.useState)(null);
    const [viewAccount, setViewAccount] = (0, react_1.useState)(true);
    const sigmaSettings = (0, react_1.useMemo)(() => ({
        nodeProgramClasses: {
            image: (0, node_image_1.createNodeImageProgram)({
                size: { mode: "force", value: 256 },
            }),
        },
        defaultDrawNodeLabel: canvas_utils_1.drawLabel,
        defaultDrawNodeHover: canvas_utils_1.drawHover,
        defaultNodeType: "image",
        defaultEdgeType: "arrow",
        labelDensity: 0.07,
        labelGridCellSize: 60,
        labelRenderedSizeThreshold: 15,
        labelFont: "Lato, sans-serif",
        zIndex: true,
    }), []);
    (0, react_1.useEffect)(() => {
        var _a, _b, _c, _d;
        if (!(0, pdos_1.default)().started)
            return;
        if (!((_b = (_a = (0, pdos_1.default)().modules) === null || _a === void 0 ? void 0 : _a.auth) === null || _b === void 0 ? void 0 : _b.info.isAuthenticated)) {
            return;
        }
        if ((_d = (_c = (0, pdos_1.default)().modules) === null || _c === void 0 ? void 0 : _c.auth) === null || _d === void 0 ? void 0 : _d.info.pdosRoot) {
            setDataset(Object.assign(Object.assign({}, (0, pdos_2.getTreeGraphSnapshot)()), { clusters: pdos_3.CLUSTERS, tags: pdos_4.TAGS }));
            setFiltersState({
                clusters: (0, lodash_1.mapValues)((0, lodash_1.keyBy)(pdos_3.CLUSTERS, "key"), (0, lodash_1.constant)(true)),
                tags: (0, lodash_1.mapValues)((0, lodash_1.keyBy)(pdos_4.TAGS, "key"), (0, lodash_1.constant)(true)),
            });
            setDataReady(true);
        }
    }, [(0, pdos_1.default)().started, (_b = (_a = (0, pdos_1.default)().modules) === null || _a === void 0 ? void 0 : _a.auth) === null || _b === void 0 ? void 0 : _b.info.pdosRoot, (_d = (_c = (0, pdos_1.default)().modules) === null || _c === void 0 ? void 0 : _c.auth) === null || _d === void 0 ? void 0 : _d.info.isAuthenticated]);
    const isAuthenticated = (_f = (_e = (0, pdos_1.default)().modules) === null || _e === void 0 ? void 0 : _e.auth) === null || _f === void 0 ? void 0 : _f.info.isAuthenticated;
    return ((0, jsx_runtime_1.jsxs)("div", { id: "app-root", className: showContents ? "show-contents" : "", style: { display: 'flex', flexDirection: 'row' }, children: [isAuthenticated && !viewAccount && ((0, jsx_runtime_1.jsx)("div", { style: {
                    display: 'flex',
                    flexDirection: "row",
                    position: 'fixed',
                    top: 10,
                    left: 80,
                    zIndex: 100,
                    gap: '10px'
                }, children: (0, jsx_runtime_1.jsx)("button", { className: "button", onClick: () => setViewAccount(!viewAccount), children: viewAccount ? "View PDOS" : "View Account" }) })), (0, jsx_runtime_1.jsx)("img", { src: logo_png_1.default, width: 50, height: 50, style: { position: 'fixed', zIndex: 110, top: 15, left: 5 } }), (0, jsx_runtime_1.jsx)("img", { src: mountains_webp_1.default, width: 40, style: { position: 'fixed', zIndex: 100, height: '100vh', width: "60px", objectFit: 'cover' } }), (0, jsx_runtime_1.jsx)("div", { style: { position: 'relative', paddingLeft: '60px', height: "100vh", width: 'calc(100vw - 60px)' }, children: viewAccount ? ((0, jsx_runtime_1.jsx)(Account_1.default, { switchView: () => setViewAccount(!viewAccount) })) : ((0, jsx_runtime_1.jsxs)(core_1.SigmaContainer, { graph: graphology_1.DirectedGraph, settings: sigmaSettings, className: "react-sigma", children: [(0, jsx_runtime_1.jsx)(GraphEventsController_1.default, { setHoveredNode: setHoveredNode }), dataset && (0, jsx_runtime_1.jsx)(GraphDataController_1.default, { dataset: dataset, filters: filtersState }), dataReady && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "controls", children: [(0, jsx_runtime_1.jsx)("div", { className: "react-sigma-control ico", children: (0, jsx_runtime_1.jsx)("button", { type: "button", className: "show-contents", onClick: () => setShowContents(true), title: "Show caption and description", children: (0, jsx_runtime_1.jsx)(bi_1.BiBookContent, {}) }) }), (0, jsx_runtime_1.jsxs)(core_1.FullScreenControl, { className: "ico", children: [(0, jsx_runtime_1.jsx)(bs_1.BsArrowsFullscreen, {}), (0, jsx_runtime_1.jsx)(bs_1.BsFullscreenExit, {})] }), (0, jsx_runtime_1.jsxs)(core_1.ZoomControl, { className: "ico", children: [(0, jsx_runtime_1.jsx)(bs_1.BsZoomIn, {}), (0, jsx_runtime_1.jsx)(bs_1.BsZoomOut, {}), (0, jsx_runtime_1.jsx)(bi_1.BiRadioCircleMarked, {})] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "contents", children: [(0, jsx_runtime_1.jsx)("div", { className: "ico", children: (0, jsx_runtime_1.jsx)("button", { type: "button", className: "ico hide-contents", onClick: () => setShowContents(false), title: "Show caption and description", children: (0, jsx_runtime_1.jsx)(gr_1.GrClose, {}) }) }), (0, jsx_runtime_1.jsx)("div", { className: "panels", children: typeof hoveredNode == "object" && (0, jsx_runtime_1.jsx)(Panel_1.default, { initiallyDeployed: true, title: (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, {}), children: hoveredNode !== null && (0, jsx_runtime_1.jsx)("div", { style: { width: "450px", overflowX: 'scroll' }, children: hoveredNode && (0, jsx_runtime_1.jsx)(react_json_view_1.default, { src: hoveredNode }) }) }) })] })] }))] })) })] }));
});
exports.default = Root;
//# sourceMappingURL=Root.js.map