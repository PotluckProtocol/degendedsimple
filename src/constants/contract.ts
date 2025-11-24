// src/constants/contract.ts
// Smart contract addresses and configuration
// These contracts are deployed on Base Sepolia testnet

import { client } from "@/app/client";
import { getContract } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";

// Prediction Market Contract Address
// Handles market creation, share purchases, resolution, and reward claims
export const contractAddress = "0x124D803F8BC43cE1081110a08ADd1cABc5c83a3f";

// ERC20 Token Contract Address
// Used for purchasing shares in prediction markets
export const tokenAddress = "0x4D9604603527322F44c318FB984ED9b5A9Ce9f71";

// Contract instance for prediction market interactions
export const contract = getContract({
    client: client,
    chain: baseSepolia,
    address: contractAddress
});

// Contract instance for ERC20 token interactions (approvals, transfers)
export const tokenContract = getContract({
    client: client,
    chain: baseSepolia,
    address: tokenAddress
});