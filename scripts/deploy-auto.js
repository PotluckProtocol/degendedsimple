const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const RPC_URL = "https://rpc.soniclabs.com";
const CHAIN_ID = 146;
const USDC_ADDRESS = "0x29219dd400f2Bf60E5a23d13Be72B486D4038894";
const PRIVATE_KEY = "0x6fce8563d2f1a23960cfd7fee4da21b9065bc41b0a92735ce38212d5fe531377";

async function deploy() {
  console.log("🚀 Auto-deploying PredictionMarket to Sonic Mainnet...\n");

  // Connect to Sonic Mainnet
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("📝 Deploying with account:", wallet.address);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log("💰 Account balance:", ethers.utils.formatEther(balance), "S\n");

  if (balance.eq(0)) {
    console.error("❌ Error: Account has no balance. Please fund your wallet with Sonic tokens (S)");
    process.exit(1);
  }

  // Compile contract first using Hardhat
  console.log("📦 Compiling contract...");
  try {
    execSync("npx hardhat compile", { stdio: 'inherit' });
  } catch (error) {
    console.error("❌ Compilation failed. Trying alternative method...");
    // Continue anyway - thirdweb will compile
  }

  // Read compiled artifact
  const artifactPath = path.join(__dirname, "..", "artifacts", "contracts", "PredictionMarket.sol", "PredictionMarket.json");
  
  if (!fs.existsSync(artifactPath)) {
    console.log("⚠️  Artifact not found. Using thirdweb deploy instead...");
    console.log("\n📋 Please run manually:");
    console.log("   npx thirdweb deploy -k D92BnAhNzykDbcIqzfPg1d_CgNM1qwpzjR2Ld27fageb8U5wGrCtRdleQ_fXmykMsaii_UQQeU3kO3uOGMY9Xw");
    console.log("   Then select PredictionMarket and follow prompts.");
    process.exit(0);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);

  console.log("📤 Deploying contract...");
  const contract = await factory.deploy(USDC_ADDRESS);
  
  console.log("⏳ Waiting for deployment confirmation...");
  await contract.deployed();
  
  const address = contract.address;
  
  console.log("\n✅ PredictionMarket deployed successfully!");
  console.log("📍 Contract address:", address);
  console.log("🔗 Network: Sonic Mainnet (Chain ID: 146)");
  console.log("💵 USDC address:", USDC_ADDRESS);
  
  // Update .env.local
  const envPath = path.join(__dirname, "..", ".env.local");
  let envContent = "";
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  }
  
  // Update or add contract address
  if (envContent.includes("NEXT_PUBLIC_CONTRACT_ADDRESS")) {
    envContent = envContent.replace(
      /NEXT_PUBLIC_CONTRACT_ADDRESS=.*/,
      `NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`
    );
  } else {
    envContent += `\nNEXT_PUBLIC_CONTRACT_ADDRESS=${address}\n`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log("\n✅ Updated .env.local with contract address!");
  console.log("\n📋 Next steps:");
  console.log("1. Restart your dev server: npm run dev");
  console.log("2. Your app is now connected to the deployed contract!");
  console.log("\n🎉 Deployment complete!");
}

deploy().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});

