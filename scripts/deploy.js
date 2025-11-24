const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying PredictionMarket contract to Sonic Mainnet...\n");

  // USDC address on Sonic Mainnet
  const usdcAddress = "0x29219dd400f2Bf60E5a23d13Be72B486D4038894";

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "S\n");

  // Deploy PredictionMarket
  console.log("📦 Deploying PredictionMarket...");
  const PredictionMarket = await hre.ethers.getContractFactory("PredictionMarket");
  const predictionMarket = await PredictionMarket.deploy(usdcAddress);

  await predictionMarket.waitForDeployment();
  const address = await predictionMarket.getAddress();

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


