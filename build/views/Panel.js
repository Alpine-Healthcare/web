import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import AnimateHeight from "react-animate-height";
const DURATION = 300;
const Panel = ({ initiallyDeployed, children, }) => {
    const [isDeployed] = useState(initiallyDeployed || false);
    const dom = useRef(null);
    useEffect(() => {
        if (isDeployed)
            setTimeout(() => {
                if (dom.current)
                    dom.current.parentElement?.scrollTo({ top: dom.current.offsetTop - 5, behavior: "smooth" });
            }, DURATION);
    }, [isDeployed]);
    return (_jsx("div", { className: "panel", ref: dom, style: { display: !children ? 'none' : 'flex' }, children: _jsx(AnimateHeight, { duration: DURATION, height: isDeployed ? "auto" : 0, children: children }) }));
};
export default Panel;
//# sourceMappingURL=Panel.js.map