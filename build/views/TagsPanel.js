import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useSigma } from "@react-sigma/core";
import { keyBy, mapValues, sortBy, values } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
import { MdCategory } from "react-icons/md";
import Panel from "./Panel";
const TagsPanel = ({ tags, filters, toggleTag, setTags }) => {
    const sigma = useSigma();
    const graph = sigma.getGraph();
    const nodesPerTag = useMemo(() => {
        const index = {};
        graph.forEachNode((_, { tag }) => (index[tag] = (index[tag] || 0) + 1));
        return index;
    }, []);
    const maxNodesPerTag = useMemo(() => Math.max(...values(nodesPerTag)), [nodesPerTag]);
    const visibleTagsCount = useMemo(() => Object.keys(filters.tags).length, [filters]);
    const [visibleNodesPerTag, setVisibleNodesPerTag] = useState(nodesPerTag);
    useEffect(() => {
        requestAnimationFrame(() => {
            const index = {};
            graph.forEachNode((_, { tag, hidden }) => !hidden && (index[tag] = (index[tag] || 0) + 1));
            setVisibleNodesPerTag(index);
        });
    }, [filters]);
    const sortedTags = useMemo(() => sortBy(tags, (tag) => (tag.key === "unknown" ? Infinity : -nodesPerTag[tag.key])), [tags, nodesPerTag]);
    return (_jsxs(Panel, { title: _jsxs(_Fragment, { children: [_jsx(MdCategory, { className: "text-muted" }), " Categories", visibleTagsCount < tags.length ? (_jsxs("span", { className: "text-muted text-small", children: [" ", "(", visibleTagsCount, " / ", tags.length, ")"] })) : ("")] }), children: [_jsx("p", { children: _jsx("i", { className: "text-muted", children: "Click a category to show/hide related pages from the network." }) }), _jsxs("p", { className: "buttons", children: [_jsxs("button", { className: "btn", onClick: () => setTags(mapValues(keyBy(tags, "key"), () => true)), children: [_jsx(AiOutlineCheckCircle, {}), " Check all"] }), " ", _jsxs("button", { className: "btn", onClick: () => setTags({}), children: [_jsx(AiOutlineCloseCircle, {}), " Uncheck all"] })] }), _jsx("ul", { children: sortedTags.map((tag) => {
                    const nodesCount = nodesPerTag[tag.key];
                    const visibleNodesCount = visibleNodesPerTag[tag.key] || 0;
                    return (_jsxs("li", { className: "caption-row", title: `${nodesCount} page${nodesCount > 1 ? "s" : ""}${visibleNodesCount !== nodesCount ? ` (only ${visibleNodesCount} visible)` : ""}`, children: [_jsx("input", { type: "checkbox", checked: filters.tags[tag.key] || false, onChange: () => toggleTag(tag.key), id: `tag-${tag.key}` }), _jsxs("label", { htmlFor: `tag-${tag.key}`, children: [_jsx("span", { className: "circle", style: { backgroundImage: `url(./images/${tag.image})` } }), " ", _jsxs("div", { className: "node-label", children: [_jsx("span", { children: tag.key }), _jsx("div", { className: "bar", style: { width: (100 * nodesCount) / maxNodesPerTag + "%" }, children: _jsx("div", { className: "inside-bar", style: {
                                                        width: (100 * visibleNodesCount) / nodesCount + "%",
                                                    } }) })] })] })] }, tag.key));
                }) })] }));
};
export default TagsPanel;
//# sourceMappingURL=TagsPanel.js.map