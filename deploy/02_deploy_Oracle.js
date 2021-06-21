module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy, catchUnknownSigner} = deployments;
    const {deployer} = await getNamedAccounts();
    const Storage = await deployments.get('Storage');
    const networkContracts = {
        hardhat: 'OracleMatic',
        matic: 'OracleMatic',
        maticTestnet: 'OracleMatic',
        // TODO add right contracts depending on network names
    }
    const network = hre.network.name
    const contractName = networkContracts[network];
    console.log('contract name:', contractName, 'for network:', network);
    if (!contractName) {
        console.log('!!! Contract name is not specified for network:', network);
    } else {
        await catchUnknownSigner(
            deploy(contractName, {
                from: deployer,
                args: [Storage.address],
                log: true,
            })
        );
    }
};
module.exports.tags = ['Oracle'];
module.exports.dependencies = ['Storage'];