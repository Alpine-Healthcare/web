import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { usePrivy } from '@privy-io/react-auth';
import { useWallets } from '@privy-io/react-auth';
import { pdos, actions } from "@alpinehealthcare/pdos";
import './Account.css';
export default observer(function App({ switchView }) {
    const [newPDOSRoot, setNewPDOSRoot] = useState('');
    const [newComputeNodeHash, setNewComputeNodeHash] = useState('');
    const { ready: walletReady, wallets } = useWallets();
    const { ready, authenticated, logout, login } = usePrivy();
    useEffect(() => {
        const getWallet = async () => {
            if (wallets.length > 0 && authenticated && !pdos()?.modules?.auth?.info.isAuthenticated && pdos().started) {
                const ethProvider = await wallets[0].getEthereumProvider();
                pdos().modules?.auth?.initializeWalletUser(ethProvider);
            }
        };
        getWallet();
    }, [walletReady, wallets, authenticated, pdos().started]);
    if (!pdos().started) {
        return null;
    }
    const disableLogin = !ready || (ready && authenticated);
    if (!pdos().modules?.auth?.info.isAuthenticated) {
        return (_jsx("div", { style: {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
            }, children: _jsx("button", { className: "moving-color-button", disabled: disableLogin, onClick: login, children: "Connect" }) }));
    }
    if (pdos().modules?.auth?.initStep && pdos().modules?.auth?.initStep !== 'Completed') {
        return (_jsx("div", { style: {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                marginTop: '100px',
                alignItems: 'center',
                height: '100vh',
            }, children: _jsx("button", { className: "moving-color-button", disabled: true, onClick: login, style: { width: "300px", height: "50px" }, children: pdos().modules?.auth?.initStep }) }));
    }
    return (_jsxs("div", { className: "container", children: [pdos().modules?.auth?.info.isAuthenticated && ready && (_jsxs("div", { children: [_jsx("button", { style: { marginBottom: '20px' }, onClick: async () => {
                            logout();
                            await pdos().modules?.auth?.disconnectWalletUser();
                        }, className: "button button-red", children: "Disconnect" }), _jsx("button", { style: { marginLeft: '10px', marginBottom: '20px' }, onClick: async () => {
                            switchView();
                        }, className: "button button-red", children: "View PDOS Tree" })] })), pdos().modules?.auth?.info.isAuthenticated && (_jsxs("div", { className: "content", children: [_jsxs("div", { className: "card", children: [_jsx("h3", { children: "Alpine Contract Details" }), _jsxs("p", { children: [_jsx("strong", { children: "Connected:" }), " ", pdos().modules?.auth?.publicKey] }), _jsxs("p", { children: [_jsx("strong", { children: "Active:" }), " ", JSON.stringify(pdos().modules?.auth?.info.isActive)] }), _jsxs("p", { children: [_jsx("strong", { children: "PDOS Root Hash:" }), " ", pdos().modules?.auth?.info.pdosRoot] }), _jsxs("p", { children: [_jsx("strong", { children: "Compute Node Address:" }), " ", pdos().modules?.auth?.info.computeNodeAddress] })] }), _jsxs("div", { className: "card", children: [_jsx("h3", { children: "Alpine Contract Updates" }), _jsxs("div", { style: { display: 'flex', flexDirection: "row", gap: '10px' }, children: [_jsx("input", { className: "input", placeholder: "New PDOS Root", value: newPDOSRoot, onChange: (e) => setNewPDOSRoot(e.target.value) }), _jsx("button", { onClick: () => pdos().modules?.auth?.updatePDOSRoot(newPDOSRoot), className: "button button-blue", children: "Update" })] }), _jsxs("div", { style: { display: 'flex', flexDirection: "row", gap: '10px' }, children: [_jsx("input", { className: "input", placeholder: "New Compute Node Hash", value: newComputeNodeHash, onChange: (e) => setNewComputeNodeHash(e.target.value) }), _jsx("button", { onClick: () => pdos().modules?.auth?.addComputeNodeAccessForUser(newComputeNodeHash), className: "button button-blue", children: "Update " })] }), _jsx("div", { style: { display: 'flex', flexDirection: "row", gap: '10px' }, children: _jsx("button", { onClick: () => pdos().modules?.auth?.offboard(), className: "button button-blue", children: "Offboard User " }) })] }), _jsxs("div", { className: "card", children: [_jsx("h3", { children: "Alpine Marketplace AI Health Agents" }), _jsx("button", { onClick: async () => await actions.treatments.addTreatment("Weight Watcher", "QmeFC86hWxLE2tC7riwZfe7T7B6mzRye6xR8hhXiAxmUAB", {}), className: "button button-purple", children: "Add Weight Watcher" })] }), _jsxs("div", { className: "card", children: [_jsx("h3", { children: "PDOS" }), _jsx("button", { onClick: () => actions.data.sync(), className: "button button-yellow", children: "Sync Data" })] })] }))] }));
});
//# sourceMappingURL=Account.js.map