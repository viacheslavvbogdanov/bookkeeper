const {getAddressBookForNetwork, getNetworkOrForkName} = require('../deploy-tools/deploy-tools')

module.exports = async ({getNamedAccounts, deployments, network}) => {

    const a = getAddressBookForNetwork(network);
    console.log('+ Setting up Oracle for ');
    let keyTokens, pricingTokens, definedOutputToken, swaps;

    async function getSwapAddress(swapName) {

        const contract = await deployments.get(swapName);
        return contract.address;
    }

    const fork = getNetworkOrForkName(network);
    switch (fork) {
        case 'mainnet':
            definedOutputToken = a.USDC;
            keyTokens = [a.USDC, a.WETH, a.DAI, a.USDT, a.UST, a.WBTC, a.EURS, a.LINK];
            pricingTokens = [a.USDC, a.WETH, a.DAI, a.USDT, a.WBTC, a.EURS];
            swaps = [
                await getSwapAddress('UniSwap'), // Primary swap, used in getKeyTokenPrice
                await getSwapAddress('SushiSwap'),
                await getSwapAddress('CurveSwap'),
                await getSwapAddress('OneInchSwap')
            ];
            break

        case 'bsc':
            definedOutputToken = a.BUSD;
            keyTokens = [a.USDC, a.ETH, a.DAI, a.USDT, a.UST, a.BTCB, a.BUSD, a.WBNB, a.VAI, a.ONEINCH];
            pricingTokens = [a.WBNB, a.BUSD, a.UST, a.USDT, a.USDC, a.VAI, a.DAI];
            swaps = [
                await getSwapAddress('PancakeSwap'), // Primary swap, used in getKeyTokenPrice
                await getSwapAddress('OneInchSwap'),
            ];
            break

        case 'matic':
            definedOutputToken = a.USDC;
            keyTokens = [a.WMATIC, a.USDC, a.DAI, a.USDT, a.WBTC, a.WETH];
            pricingTokens = [a.WMATIC, a.USDC, a.DAI, a.USDT, a.WBTC, a.WETH];
            swaps = [
                await getSwapAddress('SushiSwap'), // Primary swap, used in getKeyTokenPrice
                await getSwapAddress('QuickSwap'),
                await getSwapAddress('WaultSwap'),
            ];
            break


        default:
            console.log('- ERROR: UNKNOWN FORK');
            return
    }

    const {execute} = deployments;
    const {deployer} = await getNamedAccounts();
    const contractName = 'OracleBase';
    const options = {from: deployer}

    console.log( 'addKeyTokens' );
    await execute(contractName, options, 'addKeyTokens', keyTokens);
    console.log( 'addPricingTokens' );
    await execute(contractName, options, 'addPricingTokens', pricingTokens);
    console.log( 'changeDefinedOutput' );
    await execute(contractName, options, 'changeDefinedOutput', definedOutputToken);
    console.log( 'addSwaps', swaps );
    await execute(contractName, options, 'addSwaps', swaps);

};
module.exports.tags = ['Setup'];
module.exports.dependencies = ['Storage','Oracle'];