// src/constants/chain.ts
// Chain configuration for Sonic mainnet
import { defineChain } from "thirdweb/chains";

/**
 * Sonic Mainnet Configuration
 * Chain ID: 146
 * RPC: https://rpc.soniclabs.com
 */
export const sonic = defineChain({
  id: 146,
  name: "Sonic",
  nativeCurrency: {
    name: "Sonic",
    symbol: "S",
    decimals: 18,
  },
  rpc: "https://rpc.soniclabs.com",
});


