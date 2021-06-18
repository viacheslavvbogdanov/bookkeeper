require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-ethers");
require("hardhat-gas-reporter");

const keys = require('./dev-keys.json');
const ethForkUrl = "https://eth-mainnet.alchemyapi.io/v2/" + keys.alchemyKeyMainnet;
const bscForkUrl = "https://bsc-dataseed1.ninicoin.io/";
// const maticForkUrl = "https://rpc-mainnet.maticvigil.com/";
const maticForkUrl = "https://matic-mainnet.chainstacklabs.com";
// const maticForkUrl = "https://polygon-mainnet.infura.io/v3/"+ keys.infuraProjectId;

let chainId = 1
let forkUrl = ethForkUrl
let blockNumber = 12625928 //TODO update to latest from etherscan

if (process.env.FORK_BSC || keys.fork==='bsc') {
  chainId = 56
  forkUrl = bscForkUrl
  blockNumber = 8313231 //TODO update to latest from bscscan

} else if (process.env.FORK_MATIC || keys.fork==='matic') {
  chainId = 137
  forkUrl = maticForkUrl
  blockNumber = undefined
}

console.log('forkUrl', forkUrl);
console.log('chainId', chainId);

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      chainId: chainId,
      forking: {
        url: forkUrl,
        blockNumber: blockNumber,
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
    matic: {
      url: "https://rpc-mainnet.maticvigil.com/",
      chainId: 137,
    },
  },
  etherscan: {
    apiKey: (process.env.BSC) ? keys.bscscanAPI : keys.etherscanAPI
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
