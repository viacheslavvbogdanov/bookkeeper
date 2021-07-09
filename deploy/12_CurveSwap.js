const {deploySwap, getAddressBookForNetwork } = require('../deploy-tools/deploy-tools')
module.exports = async (hre) => {
    const addresses = getAddressBookForNetwork(hre.network);
    const baseCurrency = addresses.CurveSwapBaseCurrency;
    if (!baseCurrency) {
        console.log('-  No CurveSwapBaseCurrency for', hre.network.name, 'Skipping...');
        return;
    }
    const Oracle = await hre.deployments.get('OracleBase');
    return await deploySwap(hre, 'CurveSwap',[baseCurrency, Oracle.address])
};
module.exports.tags = ['Swap'];
module.exports.dependencies = ['Storage'];