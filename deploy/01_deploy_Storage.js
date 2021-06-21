module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy, catchUnknownSigner} = deployments;
    const {deployer} = await getNamedAccounts();
    await catchUnknownSigner(
        deploy('Storage', {
            from: deployer,
            args: [],
            log: true,
        })
    );
};
module.exports.tags = ['Storage'];