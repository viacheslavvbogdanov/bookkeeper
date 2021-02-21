# Bookkeeper

> Bookkeeper keeps track of things around the farms, especially the crops, and how they are performing. It's not hard work, but it's still important.

Bookkeeper is a contract that provides a convenient interface for retrieving important data from the various strategies, vaults, and pools that are a part of Harvest.finance.

## Important Links

- [Terrastruct diagram](https://app.terrastruct.com/diagrams/630052376)
- [Data Available via Bookkeeper](BookkeeperData.md)
- [Bookkeeper Approach](BookkeeperApproach.md)

# Oracle

Oracle will be a universal price oracle, providing price data for any asset using DEX LPs

## Important Links

- [Oracle Approach](OracleApproach.md)

# Hardhat environment

The project uses Hardhat to compile, test and deploy solidity smart contracts.

## Installation

1. To use Hardhat install all dependencies from `package.json` using `npm install`.
2. Create a `dev-keys.json` file with your Alchemy API key:

```
  {
    "alchemyKey": "<your-alchemy-key>"
  }
```

## Run

To run use the commands available in [Hardhat](https://hardhat.org/). You can compile the contracts using `npx hardhat compile` and run tests using `npx hardhat test [test file]`.
