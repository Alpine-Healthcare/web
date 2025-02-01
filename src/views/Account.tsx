import { useState } from 'react';
import { observer } from 'mobx-react-lite';

// @ts-ignore 
import pdos, {actions, Core } from "@alpinehealthcare/pdos";
 
export default observer(function App() {
    const [ newPDOSRoot, setNewPDOSRoot ] = useState('')
    const [ newComputeNodeHash, setNewComputeNodeHash ] = useState('')
    const [ newOnboard, setNewOnboard] = useState('')

    if (!pdos().started) {
      return null
    }
 
    return (
      <div
        style={{
            height: '100%',
            width: "100%",
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            overflowY: 'auto',
            padding: '20px'
        }} 
    >
          {!pdos().modules?.auth.info.isAuthenticated && (
            <button
              className="moving-color-button"
              onClick={async () => await pdos().modules?.auth.initializeWalletUser()}
            >
              connect
            </button>
          )}
          {pdos().modules?.auth.info.isAuthenticated && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: '20px', border: '1px dotted black', padding: "30px"}}>
                <p style={{ fontSize: '15px'}}><strong>Connected:</strong> {pdos().modules?.auth.publicKey}</p>
                <p style={{ fontSize: '15px'}}><strong>Active:</strong> {JSON.stringify(pdos().modules?.auth.info.isActive)}</p>
                <p style={{ fontSize: '15px'}}><strong>PDOS Root Hash:</strong> {pdos().modules?.auth.info.pdosRoot} </p>
                <p style={{ fontSize: '15px'}}><strong>Compute Node Address:</strong> {pdos().modules?.auth.info.computeNodeAddress} </p>
              </div>
              <div  style={{marginTop: '20px', border: '1px dotted black', padding: "30px"}}>
                <h3 style={{ marginBottom: "20px"}}>Alpine Contract Actions</h3>
                <div style={{ display: 'flex', flexDirection:'row', gap: '10px'}}>
                  <button onClick={() => pdos().modules?.auth.checkIsActive()}>check if active</button>
                </div>
              </div>
  
              <div style={{ width: "100%", display: "flex", flexDirection: "column", marginTop: '20px', gap: "5px", border: '1px dotted black', padding: "30px"}}>
                <h3 style={{ marginBottom: "20px"}}>Alpine Contract Updates</h3>
                <input value={newPDOSRoot} onChange={(e) => setNewPDOSRoot(e.target.value)} />
                <button onClick={() => pdos().modules?.auth.updatePDOSRoot(newPDOSRoot)}>Update PDOS Root</button>
                <input  style={{ marginTop: '20px'}} value={newComputeNodeHash} onChange={(e) => setNewComputeNodeHash(e.target.value)} />
                <button onClick={() => pdos().modules?.auth.addComputeNodeAccessForUser(newComputeNodeHash)}>Update Compute Node Address</button>
                <input style={{ marginTop: '20px'}} value={newOnboard} onChange={(e) => setNewOnboard(e.target.value)} />
                <input style={{ marginTop: '0px'}} value={newOnboard} onChange={(e) => setNewOnboard(e.target.value)} />
                <button onClick={() => pdos().modules?.auth.onboard()}>Onboard</button>
              </div>
              <div  style={{marginTop: '20px', border: '1px dotted black', padding: "30px"}}>
                <h3 style={{ marginBottom: "20px"}}>PDOS Actions</h3>
                <div style={{ display: 'flex', flexDirection:'row', gap: '10px'}}>
                  <button onClick={() => actions.data.sync()}>Sync Data</button>
                </div>
              </div>

              <div style={{ width: "100%", display: "flex", flexDirection: "column", marginTop: '20px', gap: "5px", border: '1px dotted black', padding: "30px"}}>
                <h3 style={{ marginBottom: "20px"}}>Health Agents</h3>
                <button onClick={async () => await actions.treatments.addTreatment("Weight Watcher", "QmeFC86hWxLE2tC7riwZfe7T7B6mzRye6xR8hhXiAxmUAB", {})}>Add weight watcher</button>
              </div>
            </div>
          )}
      </div>
    );
  })