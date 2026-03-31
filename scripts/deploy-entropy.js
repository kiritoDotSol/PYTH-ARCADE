const hre = require("hardhat");

async function main() {
  // Replace these with actual Monad deployed addresses from Pyth Docs
  // Defaults to some simulated local addresses if not found or a known testnet address
  const entropyAddress = process.env.ENTROPY_ADDRESS || "0x36825bf3Fbdf5a29E2d5148bfe7dcf7B5639e320"; // Example testnet proxy
  const providerAddress = process.env.PROVIDER_ADDRESS || "0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344"; // Example fortuna

  console.log("Deploying ArcadeEntropy...");
  console.log(`Using Entropy: ${entropyAddress}`);
  console.log(`Using Provider: ${providerAddress}`);

  const ArcadeEntropy = await hre.ethers.getContractFactory("ArcadeEntropy");
  
  const arcadeEntropy = await ArcadeEntropy.deploy(entropyAddress, providerAddress);

  await arcadeEntropy.waitForDeployment();
  const address = await arcadeEntropy.getAddress();

  console.log(`ArcadeEntropy deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
