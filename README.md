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
fork may be "matic","bsc" or "main" (used in [hardhat.config.js]())

## Run

To run use the commands available in [Hardhat](https://hardhat.org/). You can compile the contracts using `npx hardhat compile` and run tests using `npx hardhat test [test file]`. 

## Deployment to MATIC
1.Add ```MATIC_PRIVATE_KEY``` to the [dev-keys.json](dev-keys.json).

Key **should NOT** start with ```0x```. It will be added automatically.

2.Run

```hardhat --network matic deploy```

or for Mumbai Testnet

```hardhat --network maticTestnet deploy```

3.Do not forget to remove private key after deployment from the [dev-keys.json](dev-keys.json)

For deployment to other networks see [deployment/README.md]() 
or you can consider to use same procedure, 
then extend [deploy/02_deploy_Oracle.js]() (add contract names for networks) 
and [hardhat.config.js]() (add private key refs for other networks).