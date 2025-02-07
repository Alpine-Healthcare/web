"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sdk = void 0;
const wallet_sdk_1 = require("@coinbase/wallet-sdk");
exports.sdk = (0, wallet_sdk_1.createCoinbaseWalletSDK)({
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