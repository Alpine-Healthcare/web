import ReactDOM from "react-dom/client";

import buffer from "buffer";
window.Buffer = buffer.Buffer
import "./styles.css";
import Root from "./views/Root";
import {PrivyProvider} from '@privy-io/react-auth';
import {baseSepolia} from 'viem/chains';


const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <div style={{ overflowY: 'auto', height: '100%', position: 'relative', backgroundColor: '#f9f0c3'}}>
    <PrivyProvider
      appId="cm6p53yyj01x7pycb4ijhdt8e"
      config={{
        // Customize Privy's appearance in your app
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          logo: 'https://alpine.healthcare/favicon.ico',
        },
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia],
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      <Root />
    </PrivyProvider>
  </div>
);
