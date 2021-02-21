require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-truffle5");
require("hardhat-gas-reporter");

const keys = require('./dev-keys.json');

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      forking: {
        //url: "https://mainnet.infura.io/v3/" + keys.infuraKey,
        url: "https://eth-mainnet.alchemyapi.io/v2/" + keys.alchemyKeyMainnet,
        blockNumber: 11900760
      }
    },
    ropsten: {
      allowUnlimitedContractSize: true,
      url: "https://eth-ropsten.alchemyapi.io/v2/" + keys.alchemyKeyRopsten,
      accounts: ["0x" + keys.ropstenPrivateKey]
    }
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
           runs: 150
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
    gasPrice: 100,
  }
};
