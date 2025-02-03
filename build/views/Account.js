"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_auth_1 = require("@privy-io/react-auth");
const react_auth_2 = require("@privy-io/react-auth");
const pdos_1 = tslib_1.__importStar(require("@alpinehealthcare/pdos"));
require("./Account.css");
exports.default = (0, mobx_react_lite_1.observer)(function App({ switchView }) {
    var _a, _b, _c, _d, _e, _f, _g;
    const [newPDOSRoot, setNewPDOSRoot] = (0, react_1.useState)('');
    const [newComputeNodeHash, setNewComputeNodeHash] = (0, react_1.useState)('');
    const { ready: walletReady, wallets } = (0, react_auth_2.useWallets)();
    const { ready, authenticated, logout, login } = (0, react_auth_1.usePrivy)();
    console.log("wallets", wallets);
    (0, react_1.useEffect)(() => {
        const getWallet = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (wallets.length > 0 && authenticated && !((_a = (0, pdos_1.default)().modules) === null || _a === void 0 ? void 0 : _a.auth.info.isAuthenticated) && (0, pdos_1.default)().started) {
                const ethProvider = yield wallets[0].getEthereumProvider();
                (_b = (0, pdos_1.default)().modules) === null || _b === void 0 ? void 0 : _b.auth.initializeWalletUser(ethProvider);
            }
        });
        getWallet();
    }, [walletReady, wallets, authenticated, (0, pdos_1.default)().started]);
    if (!(0, pdos_1.default)().started) {
        return null;
    }
    const disableLogin = !ready || (ready && authenticated);
    if (!((_a = (0, pdos_1.default)().modules) === null || _a === void 0 ? void 0 : _a.auth.info.isAuthenticated) && ready && !authenticated) {
        return ((0, jsx_runtime_1.jsx)("div", { style: {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
            }, children: (0, jsx_runtime_1.jsx)("button", { className: "moving-color-button", disabled: disableLogin, onClick: login, children: "Connect" }) }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "container", children: [((_b = (0, pdos_1.default)().modules) === null || _b === void 0 ? void 0 : _b.auth.info.isAuthenticated) && ready && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("button", { style: { marginBottom: '20px' }, onClick: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                            var _h;
                            logout();
                            yield ((_h = (0, pdos_1.default)().modules) === null || _h === void 0 ? void 0 : _h.auth.disconnectWalletUser());
                        }), className: "button button-red", children: "Disconnect" }), (0, jsx_runtime_1.jsx)("button", { style: { marginLeft: '10px', marginBottom: '20px' }, onClick: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                            switchView();
                        }), className: "button button-red", children: "View PDOS Tree" })] })), ((_c = (0, pdos_1.default)().modules) === null || _c === void 0 ? void 0 : _c.auth.info.isAuthenticated) && ((0, jsx_runtime_1.jsxs)("div", { className: "content", children: [(0, jsx_runtime_1.jsxs)("div", { className: "card", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Alpine Contract Details" }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Connected:" }), " ", (_d = (0, pdos_1.default)().modules) === null || _d === void 0 ? void 0 : _d.auth.publicKey] }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Active:" }), " ", JSON.stringify((_e = (0, pdos_1.default)().modules) === null || _e === void 0 ? void 0 : _e.auth.info.isActive)] }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "PDOS Root Hash:" }), " ", (_f = (0, pdos_1.default)().modules) === null || _f === void 0 ? void 0 : _f.auth.info.pdosRoot] }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Compute Node Address:" }), " ", (_g = (0, pdos_1.default)().modules) === null || _g === void 0 ? void 0 : _g.auth.info.computeNodeAddress] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "card", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Alpine Contract Updates" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', flexDirection: "row", gap: '10px' }, children: [(0, jsx_runtime_1.jsx)("input", { className: "input", placeholder: "New PDOS Root", value: newPDOSRoot, onChange: (e) => setNewPDOSRoot(e.target.value) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => { var _a; return (_a = (0, pdos_1.default)().modules) === null || _a === void 0 ? void 0 : _a.auth.updatePDOSRoot(newPDOSRoot); }, className: "button button-blue", children: "Update" })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', flexDirection: "row", gap: '10px' }, children: [(0, jsx_runtime_1.jsx)("input", { className: "input", placeholder: "New Compute Node Hash", value: newComputeNodeHash, onChange: (e) => setNewComputeNodeHash(e.target.value) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => { var _a; return (_a = (0, pdos_1.default)().modules) === null || _a === void 0 ? void 0 : _a.auth.addComputeNodeAccessForUser(newComputeNodeHash); }, className: "button button-blue", children: "Update " })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "card", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Alpine Marketplace AI Health Agents" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => tslib_1.__awaiter(this, void 0, void 0, function* () { return yield pdos_1.actions.treatments.addTreatment("Weight Watcher", "QmeFC86hWxLE2tC7riwZfe7T7B6mzRye6xR8hhXiAxmUAB", {}); }), className: "button button-purple", children: "Add Weight Watcher" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "card", children: [(0, jsx_runtime_1.jsx)("h3", { children: "PDOS" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => pdos_1.actions.data.sync(), className: "button button-yellow", children: "Sync Data" })] })] }))] }));
});
//# sourceMappingURL=Account.js.map