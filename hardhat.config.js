require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-web3");
require("hardhat-gas-reporter");
require("hardhat-deploy");
require("@typechain/hardhat");
require('@openzeppelin/hardhat-upgrades');
require('hardhat-contract-sizer');
require("solidity-coverage");

const keys = require('./dev-keys.json');
const ethForkUrl = "https://eth-mainnet.alchemyapi.io/v2/" + keys.alchemyKeyMainnet;
// BSC JSON-RPC Endpoints: https://docs.binance.org/smart-chain/developer/rpc.html
// const bscForkUrl = "https://bsc-dataseed1.ninicoin.io/";
const bscForkUrl = "https://bsc-dataseed1.defibit.io/";
const maticForkUrl = "https://polygon-mainnet.g.alchemy.com/v2/" + keys.alchemyKeyPolygon;
// const maticForkUrl = "https://matic-mainnet.chainstacklabs.com";
const maticTestnetForkUrl = "https://matic-mumbai.chainstacklabs.com";

let chainId = 1
let forkUrl, blockNumber, scanApiKey

if (process.env.FORK_MAINNET || keys.fork==='mainnet') {
  chainId = 1
  forkUrl = ethForkUrl
  blockNumber = undefined // use last block number (no caching)
  // let blockNumber = 12625928 //TODO update to latest from etherscan to test with caching
  scanApiKey = keys.etherscanAPI

} else if (process.env.FORK_BSC || keys.fork==='bsc') {
  chainId = 56
  forkUrl = bscForkUrl
  blockNumber = undefined // use last block number (no caching)
  // blockNumber = 8857941 //TODO update to latest from bscscan to test with caching
  scanApiKey = keys.bscscanAPI

} else if (process.env.FORK_MATIC || keys.fork==='matic') {
  chainId = 137
  forkUrl = maticForkUrl
  blockNumber = undefined // use last block number (no caching)
  scanApiKey = keys.polygonscanAPI

}

let forking;
if (forkUrl) forking = {
  url: forkUrl,
  blockNumber: blockNumber,
}

// just couple of random private keys for testing purposes
const account1 = '0x4c9efe74ac899b09cba9bf1029b797ea250db03636d5b026c06157c84121c93c'
const account2 = '0x4c9efe74ac899b09cba9bf1029b797ea250db03636d5b026c06157c84121c93d'

const accounts = keys.DEPLOY_PRIVATE_KEY ?
    [`0x${keys.DEPLOY_PRIVATE_KEY}`,account2] :
    [account1,account2];

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
      forking: forking,
      accounts: [{
        privateKey:account1,
        balance:(5*10**18).toString()
      },{
        privateKey:account2,
        balance:(5*10**18).toString()
      }]
    },
    ropsten: {
      allowUnlimitedContractSize: true,
      url: "https://eth-ropsten.alchemyapi.io/v2/" + keys.alchemyKeyRopsten,
      accounts
    },
    mainnet: {
      url: "https://eth-mainnet.alchemyapi.io/v2/" + keys.alchemyKeyMainnet,
      accounts,
      gasPrice: 50000000000, // wei
      gas: 17500000
    },
    bsc: {
      // url: "https://bsc-dataseed.binance.org/",
      // url: "https://bsc-dataseed1.defibit.io/",
      url: "https://bsc-dataseed1.ninicoin.io/",
      // url: "wss://bsc-ws-node.nariox.org:443",
      chainId: 56,
      accounts,
      gas: 17500000
    },
    matic: {
      url: maticForkUrl,
      chainId: 137,
      accounts,
      gas: 17500000
    },
    maticTestnet: {
      url: maticTestnetForkUrl,
      chainId: 80001,
      accounts
    },
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
    account2: {
      default: 1,
    },

  },
  etherscan: {
    apiKey: scanApiKey
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
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: false, // set to true to print sizes
    disambiguatePaths: false,
  }
};
