# Deployment scripts

This directory contains deployment scripts that allow deployment of contracts to live networks.

## Ropsten

To be able to run the ropsten deployment scripts, you will need to add two keys to the `dev-keys.json` file.
1. An alchemy api key for the Ropsten Network: `"alchemyKeyRopsten": "<your-key-here>"`.
2. A private key for a Ropsten network address that will be used as deployer: `"ropstenPrivateKey": "<your-key-here>"`.

You can easily get some ether in you Ropsten wallet using https://faucet.metamask.io/.

## OracleRopsten

To deploy the Ropsten version of Oracle, use the command `npx hardhat run --network ropsten scripts/deployOracleRopsten.js`.
This will deploy a Storage contract first, to allow governance to be used in the Oracle contract. It then deploys the Oracle contract and will provide the address in your console. You can now find the contract on https://ropsten.etherscan.io/.

An already deployed version of OracleRopsten can be found here: https://ropsten.etherscan.io/address/0x3007fb4a5264ef986304935efffa307a87c4b594.

Please note that the functionality of the Oracle on test networks is very low. Firstly the Ropsten version only works with Uniswap and Sushiswap, as these are the only protocols on the testnet. Also there is no active token economy on the testnet, so it is hard to find any useable liquidity and pricing is not valid at all.

## Verify Etherscan source code

To make interaction with the contract via Etherscan possible, you can automatically verify the source code through Hardhat. You will need to add an etherscan API to the `dev-keys.json` file: `"etherscanAPI": "<your-key-here>"`.
Now use the command `npx hardhat verify --network ropsten <Put in Oracle Address> <Put in Storage Address>`, where you replace the input texts with the addresses you just got from deployment.
