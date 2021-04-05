require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-ethers");
require("hardhat-gas-reporter");

const keys = require('./dev-keys.json');
const ethForkUrl = "https://eth-mainnet.alchemyapi.io/v2/" + keys.alchemyKeyMainnet;
const bscForkUrl = "https://bsc-dataseed1.ninicoin.io/";

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      chainId: (process.env.FORK_BSC) ? 56 : 1,
      forking: {
        url: (process.env.FORK_BSC) ? bscForkUrl : ethForkUrl,
        blockNumber: (process.env.FORK_BSC) ? undefined : 11984580,
      }
    },
    ropsten: {
      allowUnlimitedContractSize: true,
      url: "https://eth-ropsten.alchemyapi.io/v2/" + keys.alchemyKeyRopsten,
      // accounts: ["0x" + keys.ropstenPrivateKey],
    },
    mainnet: {
      url: "https://eth-mainnet.alchemyapi.io/v2/" + keys.alchemyKeyMainnet,
    },
    bsc: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
    },
  },
  etherscan: {
    apiKey: keys.etherscanAPI
  },
  solidity: {
    compilers: [
      {version: "0.6.12",
       settings: {
         optimizer: {
           enabled: true,
           runs: 1
         }
       }},
    ]
  },
  mocha: {
    timeout: 2000000
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
  }
};
