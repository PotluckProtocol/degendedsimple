const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying PredictionMarket contract to Sonic Mainnet...\n");

  // USDC address on Sonic Mainnet
  const usdcAddress = "0x29219dd400f2Bf60E5a23d13Be72B486D4038894";

  // Get the deployer account
  const signers = await hre.ethers.getSigners();
  const deployer = signers[0];
  
  if (!deployer) {
    throw new Error("No deployer account found. Check PRIVATE_KEY in .env.deploy");
  }
  
  console.log("📝 Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await deployer.getBalance();
  console.log("💰 Account balance:", hre.ethers.utils.formatEther(balance), "S\n");

  if (balance.lt(hre.ethers.utils.parseEther("0.001"))) {
    console.warn("⚠️  Warning: Low balance! You may not have enough gas.");
  }

  // Deploy PredictionMarket
  console.log("📦 Deploying PredictionMarket...");
  const PredictionMarket = await hre.ethers.getContractFactory("PredictionMarket");
  console.log("⏳ Deploying transaction submitted, waiting for confirmation...");
  const predictionMarket = await PredictionMarket.deploy(usdcAddress);

  console.log("⏳ Waiting for deployment confirmation...");
  await predictionMarket.deployed();
  const address = predictionMarket.address;

  console.log("\n✅ PredictionMarket deployed successfully!");
  console.log("📍 Contract address:", address);
  console.log("🔗 Network: Sonic Mainnet (Chain ID: 146)");
  console.log("💵 USDC address:", usdcAddress);
  console.log("\n📋 Next steps:");
  console.log("1. Add this to your .env.local file:");
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
  console.log("2. Restart your dev server");
  console.log("\n🎉 Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
