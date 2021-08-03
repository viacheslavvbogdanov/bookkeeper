const {getAddressBookForNetwork} = require('../deploy-tools/deploy-tools')

module.exports = async ({getNamedAccounts, deployments, network}) => {
    const a = getAddressBookForNetwork(network);
    // console.log('AddressBook', a);
    console.log('+ Setting up ContractRegistry for ');

    const {deploy, catchUnknownSigner} = deployments;
    const {deployer} = await getNamedAccounts();
    const networkName = network.name;
    const contractName = 'ContractRegistry';
    console.log('+', contractName, 'for network:', networkName);
    await catchUnknownSigner(
        deploy(contractName, {
            from: deployer,
            args: [],
            proxy: {
                owner: deployer,
                methodName: 'initialize',
            },
            log: true,
        })
    );
};
module.exports.tags = ['Registry'];
module.exports.dependencies = [];
