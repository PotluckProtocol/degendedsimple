/**
 * Direct deployment script using ethers.js
 * Bypasses Hardhat plugins for simpler deployment
 */

require("dotenv").config({ path: ".env.deploy" });
const { ethers } = require("ethers");

const RPC_URL = "https://rpc.soniclabs.com";
const USDC_ADDRESS = "0x29219dd400f2Bf60E5a23d13Be72B486D4038894";

// Contract ABI (minimal for deployment)
const CONTRACT_ABI = [
  "constructor(address _token)",
];

async function main() {
  console.log("🚀 Deploying PredictionMarket contract to Sonic Mainnet...\n");

  // Get private key
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY not found in .env.deploy");
  }

  // Setup provider and wallet
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("📝 Deploying with account:", wallet.address);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log("💰 Account balance:", ethers.utils.formatEther(balance), "S\n");

  if (balance.lt(ethers.utils.parseEther("0.001"))) {
    console.warn("⚠️  Warning: Low balance! You may not have enough gas.");
  }

  // Read contract bytecode from artifacts
  const fs = require("fs");
  const path = require("path");
  
  const artifactPath = path.join(__dirname, "../artifacts/contracts/PredictionMarket.sol/PredictionMarket.json");
  if (!fs.existsSync(artifactPath)) {
    console.log("📦 Compiling contract first...");
    const { execSync } = require("child_process");
    execSync("npm run compile", { stdio: "inherit", cwd: path.join(__dirname, "..") });
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const bytecode = artifact.bytecode;
  const abi = artifact.abi;

  if (!bytecode) {
    throw new Error("Contract bytecode not found. Please compile first: npm run compile");
  }

  // Deploy contract
  console.log("📦 Deploying PredictionMarket...");
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  
  console.log("⏳ Deploying transaction submitted...");
  const contract = await factory.deploy(USDC_ADDRESS, {
    gasLimit: 3000000, // Set gas limit
  });

  console.log("⏳ Waiting for deployment confirmation...");
  await contract.deployed();

  const address = contract.address;

  console.log("\n✅ PredictionMarket deployed successfully!");
  console.log("📍 Contract address:", address);
  console.log("🔗 Network: Sonic Mainnet (Chain ID: 146)");
  console.log("💵 USDC address:", USDC_ADDRESS);
  console.log("\n📋 Next steps:");
  console.log("1. Add this to your .env.local file:");
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
  console.log("2. Restart your dev server");
  console.log("\n🎉 Deployment complete!");
  
  // Return address for automation
  return address;
}

main()
  .then((address) => {
    // Write address to file for automation
    const fs = require("fs");
    fs.writeFileSync(".deployed_address", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error.message);
    if (error.transaction) {
      console.error("Transaction:", error.transaction);
    }
    process.exit(1);
  });


