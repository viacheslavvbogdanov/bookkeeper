# Bookkeeper

> Bookkeeper keeps track of things around the farms, especially the crops, and how they are performing. It's not hard work, but it's still important.

Bookkeeper is a contract that provides a convenient interface for retrieving important data from the various strategies, vaults, and pools that are a part of Harvest.finance.

## Important Links

* [Terrastruct diagram](https://app.terrastruct.com/diagrams/630052376)
* [Bookkeeper Approach](BookkeeperApproach.md)


# Oracle

Oracle will be a universal price oracle, providing price data for any asset using DEX LPs


## Important Links

* [Oracle Approach](OracleApproach.md)


# Hardhat environment

The project uses Hardhat to compile, test and deploy solidity smart contracts.

## Installation

1. To use Hardhat install all dependencies from `package.json` using `npm install`.
2. Create a `dev-keys.json` file with your Alchemy API key:
```
{
  "etherscanAPI": "<your-etherscanAPI-key>",
  "alchemyKeyMainnet": "<your-alchemy-key>",
  "alchemyKeyRopsten": "<your-alchemy-key-ropsten>",
  "alchemyKey": "<your-alchemy-key>",
  "bscscanAPI": "<your-bscscanAPI-key>",
  "fork":"main",
  "MATIC_PRIVATE_KEY":""
}
```
fork may be "matic","bsc" or "mainnet" (used in [hardhat.config.js]())

## Run

To run use the commands available in [Hardhat](https://hardhat.org/). 
You can compile the contracts using `npx hardhat compile` 
and run tests using `npx hardhat test [test file]`. 

## Deployment 
All addresses for tokens and factories defined at [deployment-tools/address-book.js](deployment-tools/address-book.js)

```deployments``` folder must be added to the repository, 
to store all previous contracts, and their proxies, so later it shoud update changed contracts only.

To test deployment, first set "fork" at the [dev-keys.json](dev-keys.json) to needed network (ex."matic")
Check deployment:```npx hardhat deploy```
Run test for this network (hardhat will deploy all changed contracts automatically):  
```npx hardhat test test/matic-fork-test-OracleMatic.js```

### Deploy to production
1.Add ```DEPLOY_PRIVATE_KEY``` to the [dev-keys.json](dev-keys.json) 
Key **should NOT** start with ```0x```. It will be added automatically.

2.Run

```npx hardhat --network matic deploy```

or for Mumbai Testnet

```npx hardhat --network maticTestnet deploy```

3.Do not forget to remove private key after deployment from the [dev-keys.json](dev-keys.json)

### Verification

Run
```npx hardhat --network mainnet etherscan-verify --api-key {ether/bsc/polygon-scan API key}```

Deploy plugin executes etherscan-verify command - 
it will automatically verify all deployed contracts with their proxy.
Details: [hardhat-etherscan-verify](https://hardhat.org/plugins/hardhat-deploy.html#_4-hardhat-etherscan-verify)


# Contract Registry
###Testing
`hardhat test test/contract-registry.js`

###Coverage
`coverage --testfiles "test/contract-registry.js"`

###Deploy
Deployed with proxy.

##Registry Only
`hardhat deploy --tags Registry --network {mainnet|bsc|matic}`


Warning! Do not forget to commit deployments changes after deploy to save proxy state.
