const {getNetworkOrForkName} = require('../deploy-tools/deploy-tools')

module.exports = async ({getNamedAccounts, deployments, network}) => {

    console.log('+ Setting up Oracle for ');
    async function getSwapAddress(swapName) {
        const contract = await deployments.get(swapName);
        return contract.address;
    }

    let swaps;
    const fork = getNetworkOrForkName(network);
    switch (fork) {
        case 'mainnet':
            swaps = [
                await getSwapAddress('UniSwap'), // Primary swap, used in getKeyTokenPrice
                await getSwapAddress('SushiSwap'),
                await getSwapAddress('CurveSwap'),
                await getSwapAddress('OneInchSwap')
            ];
            break

        case 'bsc':
            swaps = [
                await getSwapAddress('PancakeSwap'), // Primary swap, used in getKeyTokenPrice
                await getSwapAddress('OneInchSwap'),
            ];
            break

        case 'matic':
            swaps = [
                await getSwapAddress('SushiSwap'), // Primary swap, used in getKeyTokenPrice
                await getSwapAddress('QuickSwap'),
                await getSwapAddress('WaultSwap'),
            ];
            break

        default:
            console.log('- ERROR: UNKNOWN NETWORK / FORK:', fork);
            return
    }

    const {execute} = deployments;
    const {deployer} = await getNamedAccounts();
    const contractName = 'OracleBase';
    const options = {from: deployer}

    console.log( 'setSwaps', swaps );
    await execute(contractName, options, 'setSwaps', swaps);

};
module.exports.tags = ['Setup'];
module.exports.dependencies = ['Storage','Oracle'];