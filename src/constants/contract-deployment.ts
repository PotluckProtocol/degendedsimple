/**
 * Contract Deployment Information
 * Stores the block number when the contract was first deployed
 * Used to query events from contract creation (most efficient)
 */

// Contract deployment block - found by scanning for first MarketCreated event
// Block: 56668150 (November 28, 2025)
export const CONTRACT_DEPLOYMENT_BLOCK = 56668150;

// Contract address
export const CONTRACT_ADDRESS = 
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 
  "0xC04c1DE26F5b01151eC72183b5615635E609cC81";

