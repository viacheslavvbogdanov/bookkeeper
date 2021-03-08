# Deployment scripts

This directory contains deployment scripts that allow deployment of contracts to live networks. In order to do this you will have to give the deployer private key and a chosen password once to initialize. This will encrypt your private key. When deploying, you need to give the password to decrypt your private key.

## Initialization

Before deployment the private key needs to be encrypted with a password. I would recommend to first try and deploy on Ropsten to familiarize yourself with the process. Note that the Ropsten version is older and has very limited functionality when deployed, but the deployment is good practice.

Before you continue make sure to disable your terminal history. You can set a password and private key using the command:
- `set PASSWORD=<<your password>> && set PRIVATE_KEY=<<your private key>> && npx hardhat run --network <<network>> deployment/setPasswordAndKey.js && set PASSWORD= && set PRIVATE_KEY=`

For the private key, omit the 0x prefix. It will be added automatically. This command will save 2 encrypted files in the folder `/encrypted`. When first running, you will need to manually create this folder in the root of the project.

At this moment to options for network are `ropsten` and `mainnet`, as defined in `hardhat.config.js`. To use these networks you will have to save your alchemy API keys in `dev-keys.json`. It should look like:
```
{
    "alchemyKeyMainnet": "<<your Mainnet API key>>",
    "alchemyKeyRopsten": "<<your Ropsten API key>>",
}
```
For every network you will have to initialize with a password and a private key separately. Currently only one key per network can be stored, so when you want to deploy with another address you have to initialize again. This will then overwrite the old password and key.

## Deployment

Now that a password and key are set, we are ready for deployment. To allow for proper governance and control structure we are going to launch the `Storage` contract first. This contract stores the address of the deployer as `Governance` and is used to assign the governance role to our deployer to every other contract we launch. The benefit is, that if for some reason we have to change governance address, we only have to do so in the `Storage` contract, and all other contracts will know. To deploy run the command:
- `set PASSWORD=<<your password>> && npx hardhat run --network <<your network>> deployment/deployStorage<<Network>>.js && set PASSWORD=`

This should give you the following output:
```
Checking password
Done
Decrypted deployer key
Deploying contracts with the account: 0x76F2995915Dbf09c43f46568E023D3A0a73591af
Storage address: 0x01081d9fA569190Bb40f8b8280ea18923037f9fC
```
Where the deployer account will show your address, and the Storage address will provide the address of the newly launched contract. This `Storage` contract address is needed as input for deploying the `Oracle` contract and any other contract in the future. So add this address to the `deployOracle<<Network>>.js` file corresponding to the network you just launched the `Storage` contract on. It should be included as an argument for the deploy function on line 17:

`const oracleMainnet = await OracleMainnet.deploy( "## PUT IN STORAGE ADDRESS ##" );`

We are now ready to launch the `Oracle` contract. This is done very much in the same way we launched the `Storage` contract. Run the command:
- `set PASSWORD=<<your password>> && npx hardhat run --network <<network>> deployment/deployOracle<<Network>>.js && set PASSWORD=`

This will give the following output:
```
Checking password
Done
Decrypted deployer key
Deploying contracts with the account: 0x76F2995915Dbf09c43f46568E023D3A0a73591af
Oracle address: 0x3d8e6d80146262469b6E2Fa88fD0B5890a4bF05C
```
Your `Oracle` contract is now live! You can find it on the given address. An already deployed version of OracleRopsten can be found here: https://ropsten.etherscan.io/address/0x3d8e6d80146262469b6E2Fa88fD0B5890a4bF05C.

Please note that the functionality of the Oracle on test networks is very low. Firstly the Ropsten version only works with Uniswap and Sushiswap, as these are the only protocols on the testnet. Also there is no active token economy on the testnet, so it is hard to find any useable liquidity and pricing is not valid at all.

## Verify Etherscan source code
To make interaction with the contract via Etherscan possible, you can automatically verify the source code through Hardhat. You will need to add an etherscan API to the `dev-keys.json` file: `"etherscanAPI": "<your-key-here>"`. After launching the two contracts they should both be verified. Do this by using the following commands:
1. `npx hardhat verify --network <<network>> <<Storage Address>>`
2. `npx hardhat verify --network <<network>> <<Oracle Address>> <<Storage Address>>`

These should give you outputs similar to these:

1.
```
Successfully submitted source code for contract
contracts/Storage.sol:Storage at 0x01081d9fA569190Bb40f8b8280ea18923037f9fC
for verification on Etherscan. Waiting for verification result...

Successfully verified contract Storage on Etherscan.
https://ropsten.etherscan.io/address/0x01081d9fA569190Bb40f8b8280ea18923037f9fC#code
```
2.
```Successfully submitted source code for contract
contracts/OracleRopsten.sol:OracleRopsten at 0x3d8e6d80146262469b6E2Fa88fD0B5890a4bF05C
for verification on Etherscan. Waiting for verification result...

Successfully verified contract OracleRopsten on Etherscan.
https://ropsten.etherscan.io/address/0x3d8e6d80146262469b6E2Fa88fD0B5890a4bF05C#code
```

All done! The contracts are up and running.
