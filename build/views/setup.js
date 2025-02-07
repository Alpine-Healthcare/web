import { createCoinbaseWalletSDK } from '@coinbase/wallet-sdk';
export const sdk = createCoinbaseWalletSDK({
    appName: "Alpine Healthcare",
    appLogoUrl: "https://alpine.healthcare/favicon.ico",
    appChainIds: [84532],
    preference: {
        options: "all",
        attribution: {
            auto: true,
        }
    },
});
//# sourceMappingURL=setup.js.map