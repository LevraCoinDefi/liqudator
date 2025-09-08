export const MAX_VESSELS_TO_CHECK = 1;
export const MAX_VESSELS_TO_LIQUIDATE = 1;

export const assets = {
  avalanche: {
    WAVAX: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
    sAVAX: "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be",
    "WETH.e": "0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab",
    GHO: "0xfc421ad3c883bf9e7c4f42de845c4e4405799e73",
    USDC18: "0xa75223aF88Ef6BDf9E8E20E8184b8B78705ecfF4",
    USDT18: "0x2e132648c3b8a810015Ede057a52B1DA423612dc",
    AUSD18: "0x97CDA380dC05497AA0B40654307F99F32c1eA326",
  }
};

export const networks = {
  avalanche: {
    rpc: "https://avalanche-mainnet.infura.io/v3/d06fcac3ac2047259ded5a4f543d1e83",
    networkToken: "AVAX",
    tokenMinimum: 0.5e18,
    VesselManagerOperations: "0xEA7160Cd7f9672E8F5ba67DF4D34D42F7d7006FA",
    DebtToken: "0xc1303E1e2f204F16C7493214C66B4D34eeBA2f2d"
  }
  // Add more networks here as needed
};
