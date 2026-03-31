require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    monadDevnet: {
        url: process.env.MONAD_DEVNET_RPC || "https://rpc-devnet.monadinfra.com/rpc/31100",
        accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
        chainId: 20143,
    },
    monadTestnet: {
        url: process.env.MONAD_TESTNET_RPC || "https://testnet-rpc.monad.xyz/",
        accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
        chainId: 10143,
    }
  }
};
