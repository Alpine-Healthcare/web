"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const bs_1 = require("react-icons/bs");
const Panel_1 = tslib_1.__importDefault(require("./Panel"));
const DescriptionPanel = () => {
    return ((0, jsx_runtime_1.jsx)(Panel_1.default, { initiallyDeployed: true, title: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(bs_1.BsInfoCircle, { className: "text-muted" }), " Description"] }), children: (0, jsx_runtime_1.jsx)("p", { children: "This map represents the directed acyclic graph that powers your account on PDOS." }) }));
};
exports.default = DescriptionPanel;
//# sourceMappingURL=DescriptionPanel.js.map