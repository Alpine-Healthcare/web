"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_animate_height_1 = tslib_1.__importDefault(require("react-animate-height"));
const DURATION = 300;
const Panel = ({ initiallyDeployed, children, }) => {
    const [isDeployed] = (0, react_1.useState)(initiallyDeployed || false);
    const dom = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if (isDeployed)
            setTimeout(() => {
                var _a;
                if (dom.current)
                    (_a = dom.current.parentElement) === null || _a === void 0 ? void 0 : _a.scrollTo({ top: dom.current.offsetTop - 5, behavior: "smooth" });
            }, DURATION);
    }, [isDeployed]);
    return ((0, jsx_runtime_1.jsx)("div", { className: "panel", ref: dom, style: { display: !children ? 'none' : 'flex' }, children: (0, jsx_runtime_1.jsx)(react_animate_height_1.default, { duration: DURATION, height: isDeployed ? "auto" : 0, children: children }) }));
};
exports.default = Panel;
//# sourceMappingURL=Panel.js.map