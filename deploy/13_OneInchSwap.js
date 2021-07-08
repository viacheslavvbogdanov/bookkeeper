const {deploySwap, getAddressBookForNetwork} = require('../deploy-tools/deploy-tools')
module.exports = async (hre) => {
    const addresses = getAddressBookForNetwork(hre.network);
    const baseCurrency = addresses.OneInchSwapBaseCurrency;
    if (!baseCurrency) {
        console.log('-  No OneInchSwapBaseCurrency for', hre.network.name, 'Skipping...');
        return;
    }
    return await deploySwap(hre, 'OneInchSwap', 'OneInchSwap',[baseCurrency]);
};
module.exports.tags = ['Swap'];
module.exports.dependencies = ['Storage'];