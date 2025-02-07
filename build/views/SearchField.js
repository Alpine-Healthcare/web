import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSigma } from "@react-sigma/core";
import { useEffect, useState } from "react";
import { BsSearch } from "react-icons/bs";
const SearchField = ({ filters, placeholder }) => {
    const sigma = useSigma();
    const [search, setSearch] = useState("");
    const [values, setValues] = useState([]);
    const [selected, setSelected] = useState(null);
    const refreshValues = () => {
        const newValues = [];
        const lcSearch = search.toLowerCase();
        if (!selected && search.length > 1) {
            sigma.getGraph().forEachNode((key, attributes) => {
                if (!attributes.hidden && attributes.label && attributes.label.toLowerCase().indexOf(lcSearch) === 0)
                    newValues.push({ id: key, label: attributes.label });
            });
        }
        setValues(newValues);
    };
    useEffect(() => refreshValues(), [search]);
    useEffect(() => {
        requestAnimationFrame(refreshValues);
    }, [filters]);
    useEffect(() => {
        if (!selected)
            return;
        sigma.getGraph().setNodeAttribute(selected, "highlighted", true);
        const nodeDisplayData = sigma.getNodeDisplayData(selected);
        if (nodeDisplayData)
            sigma.getCamera().animate({ ...nodeDisplayData, ratio: 0.05 }, {
                duration: 600,
            });
        return () => {
            sigma.getGraph().setNodeAttribute(selected, "highlighted", false);
        };
    }, [selected]);
    const onInputChange = (e) => {
        const searchString = e.target.value;
        const valueItem = values.find((value) => value.label === searchString);
        if (valueItem) {
            setSearch(valueItem.label);
            setValues([]);
            setSelected(valueItem.id);
        }
        else {
            setSelected(null);
            setSearch(searchString);
        }
    };
    const onKeyPress = (e) => {
        if (e.key === "Enter" && values.length) {
            setSearch(values[0].label);
            setSelected(values[0].id);
        }
    };
    return (_jsxs("div", { className: "search-wrapper", children: [_jsx("input", { type: "search", placeholder: placeholder ? placeholder : "Search in nodes", list: "nodes", value: search, onChange: onInputChange, onKeyPress: onKeyPress }), _jsx(BsSearch, { className: "icon" }), _jsx("datalist", { id: "nodes", children: values.map((value) => (_jsx("option", { value: value.label, children: value.label }, value.id))) })] }));
};
export default SearchField;
//# sourceMappingURL=SearchField.js.map