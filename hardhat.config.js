require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-ethers");
require("hardhat-gas-reporter");
require("hardhat-deploy");
require("@nomiclabs/hardhat-ethers");
require("@typechain/hardhat");
require('@openzeppelin/hardhat-upgrades');
require('hardhat-contract-sizer');

const keys = require('./dev-keys.json');
const ethForkUrl = "https://eth-mainnet.alchemyapi.io/v2/" + keys.alchemyKeyMainnet;
const bscForkUrl = "https://bsc-dataseed1.ninicoin.io/";
// const maticForkUrl = "https://rpc-mainnet.maticvigil.com/";
const maticForkUrl = "https://matic-mainnet.chainstacklabs.com";
const maticTestnetForkUrl = "https://matic-mumbai.chainstacklabs.com";

let chainId = 1
let forkUrl = ethForkUrl
// let blockNumber = undefined // use last block number (no caching)
let blockNumber = 12625928 //TODO update to latest from etherscan to test with caching

if (process.env.FORK_BSC || keys.fork==='bsc') {
  chainId = 56
  forkUrl = bscForkUrl
  blockNumber = undefined // use last block number (no caching)
  // blockNumber = 8857941 //TODO update to latest from bscscan to test with caching

} else if (process.env.FORK_MATIC || keys.fork==='matic') {
  chainId = 137
  forkUrl = maticForkUrl
  blockNumber = undefined // use last block number (no caching)
}

// console.log('forkUrl', forkUrl);
// console.log('chainId', chainId);

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
      // url: "https://bsc-dataseed.binance.org/",
      // url: "https://bsc-dataseed1.defibit.io/",
      url: "https://bsc-dataseed1.ninicoin.io/",
      // url: "wss://bsc-ws-node.nariox.org:443",
      // url: "wss://bsc.getblock.io/mainnet/?api_key=" + keys.getblockKey, //TODO remove
      chainId: 56,
    },
    matic: {
      url: maticForkUrl,
      chainId: 137,
      //accounts: [`0x${keys.MATIC_PRIVATE_KEY}`]
    },
    maticTestnet: {
      url: maticTestnetForkUrl,
      chainId: 80001,
      // accounts: [`0x${keys.MATIC_PRIVATE_KEY}`]
    },
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    }
  },
  etherscan: {
    apiKey: (process.env.BSC) ? keys.bscscanAPI : (process.env.ETH)?  keys.etherscanAPI : keys.polygonscanAPI
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
    "require": "hardhat/register",
    timeout: 10000000
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
  }
};
