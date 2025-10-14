const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying contracts to Base Mainnet...");

  // Deploy ContractFactory
  const ContractFactory = await ethers.getContractFactory("ContractFactory");
  const contractFactory = await ContractFactory.deploy();
  await contractFactory.waitForDeployment();
  
  const factoryAddress = await contractFactory.getAddress();
  console.log("ContractFactory deployed to:", factoryAddress);

  // Deploy BaseNFT
  const BaseNFT = await ethers.getContractFactory("BaseNFT");
  const baseNFT = await BaseNFT.deploy();
  await baseNFT.waitForDeployment();
  
  const nftAddress = await baseNFT.getAddress();
  console.log("BaseNFT deployed to:", nftAddress);

  // Deploy BaseToken
  const BaseToken = await ethers.getContractFactory("BaseToken");
  const baseToken = await BaseToken.deploy();
  await baseToken.waitForDeployment();
  
  const tokenAddress = await baseToken.getAddress();
  console.log("BaseToken deployed to:", tokenAddress);

  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log("ContractFactory:", factoryAddress);
  console.log("BaseNFT:", nftAddress);
  console.log("BaseToken:", tokenAddress);
  console.log("\nUpdate these addresses in your components!");
  
  // Verify contracts on Basescan
  console.log("\n=== VERIFICATION ===");
  console.log("Run the following commands to verify contracts:");
  console.log(`npx hardhat verify --network base ${factoryAddress}`);
  console.log(`npx hardhat verify --network base ${nftAddress}`);
  console.log(`npx hardhat verify --network base ${tokenAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

