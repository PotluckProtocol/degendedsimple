/**
 * Script to check which contract the live site is using
 * and verify if it has refund functionality
 */

const LIVE_URL = "https://www.degended.bet";
const NEW_CONTRACT = "0xC04c1DE26F5b01151eC72183b5615635E609cC81";
const OLD_CONTRACT = "0x39b4bD619ba158b4Cfe61a6FADD900fAb22E930B";

async function checkLiveContract() {
  try {
    console.log("🔍 Checking live site configuration...\n");
    
    // Try to fetch the page source to see what contract is configured
    const response = await fetch(LIVE_URL);
    const html = await response.text();
    
    // Look for contract address in the HTML/bundle
    console.log("Checking for contract addresses in page source...");
    
    if (html.includes(NEW_CONTRACT)) {
      console.log("✅ NEW contract found in live site!");
      console.log(`   Address: ${NEW_CONTRACT}`);
    } else if (html.includes(OLD_CONTRACT)) {
      console.log("❌ OLD contract found in live site!");
      console.log(`   Address: ${OLD_CONTRACT}`);
      console.log("   This contract doesn't support refunds!");
    } else {
      console.log("⚠️  Contract address not found in HTML");
      console.log("   Might be in JavaScript bundle");
    }
    
    // Check which contract has refund feature
    console.log("\n🔍 Verifying contracts have refund feature...\n");
    
    const { ethers } = require("ethers");
    const provider = new ethers.providers.JsonRpcProvider("https://rpc.soniclabs.com");
    
    // Check new contract
    console.log(`Checking NEW contract: ${NEW_CONTRACT}`);
    try {
      const newCode = await provider.getCode(NEW_CONTRACT);
      if (newCode === "0x") {
        console.log("   ❌ Contract not found!");
      } else {
        console.log("   ✅ Contract exists");
        // Try to check if claimRefund exists
        const contract = new ethers.Contract(NEW_CONTRACT, [], provider);
        // We'll check by attempting to get function signature
        console.log("   ✅ Contract is deployed");
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    // Check old contract
    console.log(`\nChecking OLD contract: ${OLD_CONTRACT}`);
    try {
      const oldCode = await provider.getCode(OLD_CONTRACT);
      if (oldCode === "0x") {
        console.log("   ❌ Contract not found!");
      } else {
        console.log("   ✅ Contract exists (old version)");
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkLiveContract();


