const getNetworkOrForkName = (network) => {
    const keys = require('../dev-keys.json');
    const networkName = network.name;
    return networkName==='hardhat' ? keys.fork : networkName;
}

const getAddressBookForNetwork = (network) => {
    const addressBook = require('../deploy-tools/address-book');
    const fork = getNetworkOrForkName(network);
    return addressBook[fork];
}

const deploySwap = async ({getNamedAccounts, deployments, network}, contractName, additionalParams) => {
    const {deploy, catchUnknownSigner} = deployments;
    const {deployer} = await getNamedAccounts();
    const addresses = getAddressBookForNetwork(network);
    const factoryAddress = addresses[contractName];
    if (!factoryAddress) {
        console.log('-  No factory address for', contractName, 'Skipping...');
        return;
    }

    console.log('+', contractName, ' factory:', factoryAddress);
    if (!additionalParams) additionalParams = [];
    await catchUnknownSigner(
        deploy(contractName, {
            from: deployer,
            args: [factoryAddress, ...additionalParams],
            log: true,
        })
    );
}

module.exports = {deploySwap, getAddressBookForNetwork, getNetworkOrForkName}
