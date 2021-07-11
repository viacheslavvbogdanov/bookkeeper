const {getAddressBookForNetwork} = require('../deploy-tools/deploy-tools')

module.exports = async ({getNamedAccounts, deployments, network}) => {
    const a = getAddressBookForNetwork(network);
    console.log('AddressBook', a);
    console.log('+ Setting up Oracle for ');

    const {deploy, catchUnknownSigner} = deployments;
    const {deployer} = await getNamedAccounts();
    const networkName = network.name;
    const Storage = await deployments.get('Storage');
    const contractName = 'OracleBase';
    console.log('+', contractName, 'for network:', networkName);
    await catchUnknownSigner(
        deploy(contractName, {
            from: deployer,
            args: [Storage.address, a.keyTokens, a.pricingTokens, a.outputToken],
            proxy: {
                owner: deployer,
                methodName: 'initialize',
            },
            log: true,
        })
    );
};
module.exports.tags = ['Oracle'];
module.exports.dependencies = ['Storage'];