const getAddressBookForNetwork = (network) => {
    const addressBook = require('../deploy-tools/address-book');
    const keys = require('../dev-keys.json');
    const networkName = network.name;
    const fork = networkName==='hardhat' ? keys.fork : networkName;
    const addresses = addressBook[fork];
    return addresses
}

const deploySwap = async ({getNamedAccounts, deployments, network}, contractName, factoryName, additionalParams) => {
    const {deploy, catchUnknownSigner} = deployments;
    const {deployer} = await getNamedAccounts();
    const addresses = getAddressBookForNetwork(network);
    factoryName = factoryName|| contractName;
    const factoryAddress = addresses[factoryName];
    if (!factoryAddress) {
        console.log('-  No factory address for', factoryName, 'Skipping...');
        return;
    }

    const Storage = await deployments.get('Storage');
    console.log('+', factoryName, '(', contractName, ') factory:', factoryAddress);
    if (!additionalParams) additionalParams = [];
    await catchUnknownSigner(
        deploy(contractName, {
            from: deployer,
            args: [factoryAddress, Storage.address, ...additionalParams],
            log: true,
        })
    );
}

module.exports = {deploySwap, getAddressBookForNetwork}