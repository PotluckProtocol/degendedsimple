const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.deploy") });

// Sonic Mainnet configuration
const RPC_URL = "https://rpc.soniclabs.com";
const CHAIN_ID = 146;
const USDC_ADDRESS = "0x29219dd400f2Bf60E5a23d13Be72B486D4038894";

// Load contract ABI (we'll compile it first or use a simple approach)
async function deploy() {
  console.log("🚀 Deploying PredictionMarket contract to Sonic Mainnet...\n");

  if (!process.env.PRIVATE_KEY) {
    console.error("❌ Error: PRIVATE_KEY not found in .env.deploy");
    console.log("Please create .env.deploy file with: PRIVATE_KEY=0x...");
    process.exit(1);
  }

  // Connect to Sonic Mainnet
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("📝 Deploying with account:", wallet.address);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "S\n");

  if (balance === 0n) {
    console.error("❌ Error: Account has no balance. Please fund your wallet with Sonic tokens (S)");
    process.exit(1);
  }

  // Read contract source
  const contractPath = path.join(__dirname, "..", "contracts", "PredictionMarket.sol");
  const contractSource = fs.readFileSync(contractPath, "utf8");

  console.log("📦 Compiling and deploying PredictionMarket...");
  console.log("⚠️  Note: This requires a Solidity compiler. For best results, use:");
  console.log("   1. thirdweb deploy (recommended)");
  console.log("   2. Or compile first with: npx hardhat compile\n");

  // For now, we'll provide instructions
  console.log("📋 Deployment Instructions:");
  console.log("1. Use thirdweb deploy:");
  console.log("   npx thirdweb deploy");
  console.log("   - Select contracts/PredictionMarket.sol");
  console.log("   - Network: Sonic Mainnet (Chain ID 146)");
  console.log("   - Constructor: " + USDC_ADDRESS);
  console.log("\n2. Or use Hardhat (after fixing config):");
  console.log("   npm run deploy:sonic");
  console.log("\n3. After deployment, update .env.local with the contract address");
}

deploy().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});


