module.exports = async ({getNamedAccounts, deployments, network}) => {
    const {deploy, catchUnknownSigner} = deployments;
    const {deployer} = await getNamedAccounts();
    const networkName = network.name;
    const Storage = await deployments.get('Storage');
    const contractName = 'OracleBase';
    console.log('+', contractName, 'for network:', networkName);
    await catchUnknownSigner(
        deploy(contractName, {
            from: deployer,
            args: [Storage.address],
            proxy: {
                owner: deployer,
                // methodName: 'initialize',
            },
            log: true,
        })
    );
};
module.exports.tags = ['Oracle'];
module.exports.dependencies = ['Storage'];