import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { usePrivy } from '@privy-io/react-auth';
import { useWallets } from '@privy-io/react-auth';

// @ts-ignore
import pdos, { actions } from "@alpinehealthcare/pdos";
import './Account.css';

export default observer(function App({ switchView }: { switchView: () => void }) {
    const [newPDOSRoot, setNewPDOSRoot] = useState('');
    const [newComputeNodeHash, setNewComputeNodeHash] = useState('');
    //const [newOnboard, setNewOnboard] = useState('');
    const { ready: walletReady, wallets } = useWallets();
    const { ready, authenticated, logout, login } = usePrivy();

    useEffect(() => {
        if (wallets.length > 0 && authenticated && !pdos().modules?.auth.info.isAuthenticated && pdos().started) {
            pdos().modules?.auth.initializeWalletUser(window.ethereum);
        }
    }, [walletReady, wallets, authenticated, pdos().started]);

    if (!pdos().started) {
        return null;
    }

    const disableLogin = !ready || (ready && authenticated);

    if (!pdos().modules?.auth.info.isAuthenticated && ready && !authenticated) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
            }}>
                <button className="moving-color-button" disabled={disableLogin} onClick={login}>
                    Connect
                </button>

            </div>

        )
    }

    return (
        <div className="container">
            {pdos().modules?.auth.info.isAuthenticated && ready && (
                <div>
                <button style={{ marginBottom: '20px'}} onClick={async () => {
                    logout()
                    await pdos().modules?.auth.disconnectWalletUser()
                }} className="button button-red">Disconnect</button>
                <button style={{ marginLeft:'10px', marginBottom: '20px'}} onClick={async () => {
                    switchView()
                }} className="button button-red">View PDOS Tree</button>
                </div>
            )}
            {pdos().modules?.auth.info.isAuthenticated && (
                <div className="content">
                    <div className="card">
                        <h3>Alpine Contract Details</h3>
                        <p><strong>Connected:</strong> {pdos().modules?.auth.publicKey}</p>
                        <p><strong>Active:</strong> {JSON.stringify(pdos().modules?.auth.info.isActive)}</p>
                        <p><strong>PDOS Root Hash:</strong> {pdos().modules?.auth.info.pdosRoot}</p>
                        <p><strong>Compute Node Address:</strong> {pdos().modules?.auth.info.computeNodeAddress}</p>
                    </div>
                    {/*<div className="card">
                        <h3>Alpine Contract Actions</h3>
                        <button onClick={() => pdos().modules?.auth.checkIsActive()} className="button button-green">Check if Active</button>
                    </div>*/}
                    <div className="card">
                        <h3>Alpine Contract Updates</h3>
                        <div style={{ display: 'flex', flexDirection: "row", gap: '10px'}}>
                            <input className="input" placeholder="New PDOS Root" value={newPDOSRoot} onChange={(e) => setNewPDOSRoot(e.target.value)} />
                            <button onClick={() => pdos().modules?.auth.updatePDOSRoot(newPDOSRoot)} className="button button-blue">Update</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: "row", gap: '10px'}}>
                        <input className="input" placeholder="New Compute Node Hash" value={newComputeNodeHash} onChange={(e) => setNewComputeNodeHash(e.target.value)} />
                        <button onClick={() => pdos().modules?.auth.addComputeNodeAccessForUser(newComputeNodeHash)} className="button button-blue">Update </button>
                        </div>
                        {/*<div style={{ display: 'flex', flexDirection: "row", gap: '10px'}}>
                        <input className="input" placeholder="Onboard" value={newOnboard} onChange={(e) => setNewOnboard(e.target.value)} />
                        <button onClick={() => pdos().modules?.auth.onboard()} className="button button-blue">Update</button>
                        </div>*/}
                    </div>
                    <div className="card">
                        <h3>Alpine Marketplace AI Health Agents</h3>
                        <button onClick={async () => await actions.treatments.addTreatment("Weight Watcher", "QmeFC86hWxLE2tC7riwZfe7T7B6mzRye6xR8hhXiAxmUAB", {})} className="button button-purple">
                            Add Weight Watcher
                        </button>
                    </div>
                    <div className="card">
                        <h3>PDOS</h3>
                        <button onClick={() => actions.data.sync()} className="button button-yellow">Sync Data</button>
                    </div>
                </div>
            )}
        </div>
    );
});
