import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { FullScreenControl, SigmaContainer, ZoomControl } from "@react-sigma/core";
import { createNodeImageProgram } from "@sigma/node-image";
import { DirectedGraph } from "graphology";
import { constant, keyBy, mapValues } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { BiBookContent, BiRadioCircleMarked } from "react-icons/bi";
import { BsArrowsFullscreen, BsFullscreenExit, BsZoomIn, BsZoomOut } from "react-icons/bs";
import { GrClose } from "react-icons/gr";
import { drawHover, drawLabel } from "../canvas-utils";
import GraphDataController from "./GraphDataController";
import GraphEventsController from "./GraphEventsController";
import Mountains from "../images/mountains.webp";
import Logo from "../images/logo.png";
import { pdos } from "@alpinehealthcare/pdos";
import { getTreeGraphSnapshot, startPDOS } from "../pdos";
import { CLUSTERS } from "../pdos";
import { TAGS } from "../pdos";
import Panel from "./Panel";
import ReactJson from "react-json-view";
import Account from "./Account";
import { observer } from "mobx-react-lite";
startPDOS();
const Root = observer(function Root() {
    const [showContents, setShowContents] = useState(false);
    const [dataReady, setDataReady] = useState(false);
    const [dataset, setDataset] = useState(null);
    const [filtersState, setFiltersState] = useState({
        clusters: {},
        tags: {},
    });
    const [hoveredNode, setHoveredNode] = useState(null);
    const [viewAccount, setViewAccount] = useState(true);
    const sigmaSettings = useMemo(() => ({
        nodeProgramClasses: {
            image: createNodeImageProgram({
                size: { mode: "force", value: 256 },
            }),
        },
        defaultDrawNodeLabel: drawLabel,
        defaultDrawNodeHover: drawHover,
        defaultNodeType: "image",
        defaultEdgeType: "arrow",
        labelDensity: 0.07,
        labelGridCellSize: 60,
        labelRenderedSizeThreshold: 15,
        labelFont: "Lato, sans-serif",
        zIndex: true,
    }), []);
    useEffect(() => {
        if (!pdos().started)
            return;
        if (!pdos().modules?.auth?.info.isAuthenticated) {
            return;
        }
        if (pdos().modules?.auth?.info.pdosRoot) {
            setDataset({
                ...getTreeGraphSnapshot(),
                clusters: CLUSTERS,
                tags: TAGS,
            });
            setFiltersState({
                clusters: mapValues(keyBy(CLUSTERS, "key"), constant(true)),
                tags: mapValues(keyBy(TAGS, "key"), constant(true)),
            });
            setDataReady(true);
        }
    }, [pdos().started, pdos().modules?.auth?.info.pdosRoot, pdos().modules?.auth?.info.isAuthenticated]);
    const isAuthenticated = pdos().modules?.auth?.info.isAuthenticated;
    return (_jsxs("div", { id: "app-root", className: showContents ? "show-contents" : "", style: { display: 'flex', flexDirection: 'row' }, children: [isAuthenticated && !viewAccount && (_jsx("div", { style: {
                    display: 'flex',
                    flexDirection: "row",
                    position: 'fixed',
                    top: 10,
                    left: 80,
                    zIndex: 100,
                    gap: '10px'
                }, children: _jsx("button", { className: "button", onClick: () => setViewAccount(!viewAccount), children: viewAccount ? "View PDOS" : "View Account" }) })), _jsx("img", { src: Logo, width: 50, height: 50, style: { position: 'fixed', zIndex: 110, top: 15, left: 5 } }), _jsx("img", { src: Mountains, width: 40, style: { position: 'fixed', zIndex: 100, height: '100vh', width: "60px", objectFit: 'cover' } }), _jsx("div", { style: { position: 'relative', paddingLeft: '60px', height: "100vh", width: 'calc(100vw - 60px)' }, children: viewAccount ? (_jsx(Account, { switchView: () => setViewAccount(!viewAccount) })) : (_jsxs(SigmaContainer, { graph: DirectedGraph, settings: sigmaSettings, className: "react-sigma", children: [_jsx(GraphEventsController, { setHoveredNode: setHoveredNode }), dataset && _jsx(GraphDataController, { dataset: dataset, filters: filtersState }), dataReady && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "controls", children: [_jsx("div", { className: "react-sigma-control ico", children: _jsx("button", { type: "button", className: "show-contents", onClick: () => setShowContents(true), title: "Show caption and description", children: _jsx(BiBookContent, {}) }) }), _jsxs(FullScreenControl, { className: "ico", children: [_jsx(BsArrowsFullscreen, {}), _jsx(BsFullscreenExit, {})] }), _jsxs(ZoomControl, { className: "ico", children: [_jsx(BsZoomIn, {}), _jsx(BsZoomOut, {}), _jsx(BiRadioCircleMarked, {})] })] }), _jsxs("div", { className: "contents", children: [_jsx("div", { className: "ico", children: _jsx("button", { type: "button", className: "ico hide-contents", onClick: () => setShowContents(false), title: "Show caption and description", children: _jsx(GrClose, {}) }) }), _jsx("div", { className: "panels", children: typeof hoveredNode == "object" && _jsx(Panel, { initiallyDeployed: true, title: _jsx(_Fragment, {}), children: hoveredNode !== null && _jsx("div", { style: { width: "450px", overflowX: 'scroll' }, children: hoveredNode && _jsx(ReactJson, { src: hoveredNode }) }) }) })] })] }))] })) })] }));
});
export default Root;
//# sourceMappingURL=Root.js.map