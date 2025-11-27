// src/constants/contract.ts
// Smart contract addresses and configuration
// Configured for Sonic mainnet with USDC

import { client } from "@/app/client";
import { getContract } from "thirdweb";
import { sonic } from "./chain";

// Prediction Market Contract Address
// Handles market creation, share purchases, resolution, and reward claims
// Can be set via NEXT_PUBLIC_CONTRACT_ADDRESS environment variable
export const contractAddress = 
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 
    "0xC04c1DE26F5b01151eC72183b5615635E609cC81"; // Latest deployed contract (with refund feature)

// USDC Token Contract Address on Sonic Mainnet
// Used for purchasing shares in prediction markets
// Contract: 0x29219dd400f2Bf60E5a23d13Be72B486D4038894
export const tokenAddress = 
    process.env.NEXT_PUBLIC_TOKEN_ADDRESS || 
    "0x29219dd400f2Bf60E5a23d13Be72B486D4038894";

// Contract instance for prediction market interactions
export const contract = getContract({
    client: client,
    chain: sonic,
    address: contractAddress
});

// Contract instance for USDC token interactions (approvals, transfers)
export const tokenContract = getContract({
    client: client,
    chain: sonic,
    address: tokenAddress
});