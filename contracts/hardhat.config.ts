import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "@nomiclabs/hardhat-solhint";
import 'solidity-coverage';
import 'hardhat-log-remover';
import "hardhat-gas-reporter"
import dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.27",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  gasReporter: {
    enabled: false
  },
  networks: {
    sepolia: {
      url: process.env.RPC_URL,
      accounts: [process.env.PRIVATE_KEY as string]
    }
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY as string
    }
  }
};

export default config;
