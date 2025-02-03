"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const client_1 = tslib_1.__importDefault(require("react-dom/client"));
const buffer_1 = tslib_1.__importDefault(require("buffer"));
window.Buffer = buffer_1.default.Buffer;
require("./styles.css");
const Root_1 = tslib_1.__importDefault(require("./views/Root"));
const react_auth_1 = require("@privy-io/react-auth");
const chains_1 = require("viem/chains");
const root = client_1.default.createRoot(document.getElementById("root"));
root.render((0, jsx_runtime_1.jsx)("div", { style: { overflowY: 'auto', height: '100%', position: 'relative', backgroundColor: '#f9f0c3' }, children: (0, jsx_runtime_1.jsx)(react_auth_1.PrivyProvider, { appId: "cm6p53yyj01x7pycb4ijhdt8e", config: {
            appearance: {
                theme: 'light',
                accentColor: '#676FFF',
                logo: 'https://alpine.healthcare/favicon.ico',
            },
            defaultChain: chains_1.baseSepolia,
            supportedChains: [chains_1.baseSepolia],
            embeddedWallets: {
                createOnLogin: 'users-without-wallets',
            },
        }, children: (0, jsx_runtime_1.jsx)(Root_1.default, {}) }) }));
//# sourceMappingURL=index.js.map