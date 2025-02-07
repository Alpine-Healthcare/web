import { jsx as _jsx } from "react/jsx-runtime";
import ReactDOM from "react-dom/client";
import buffer from "buffer";
window.Buffer = buffer.Buffer;
import "./styles.css";
import Root from "./views/Root";
import { PrivyProvider } from '@privy-io/react-auth';
import { baseSepolia } from 'viem/chains';
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(_jsx("div", { style: { overflowY: 'auto', height: '100%', position: 'relative', backgroundColor: '#f9f0c3' }, children: _jsx(PrivyProvider, { appId: "cm6p53yyj01x7pycb4ijhdt8e", config: {
            appearance: {
                theme: 'light',
                accentColor: '#676FFF',
                logo: 'https://alpine.healthcare/favicon.ico',
            },
            defaultChain: baseSepolia,
            supportedChains: [baseSepolia],
            embeddedWallets: {
                createOnLogin: 'users-without-wallets',
            },
        }, children: _jsx(Root, {}) }) }));
//# sourceMappingURL=index.js.map