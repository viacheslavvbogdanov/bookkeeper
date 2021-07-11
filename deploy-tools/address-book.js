function getMainNetAddresses() {
    const
        UniSwap =     '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        SushiSwap =   '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac',
        CurveSwap =   '0x7D86446dDb609eD0F5f8684AcF30380a356b2B4c',
        OneInchSwap = '0xbAF9A5d4b0052359326A6CDAb54BABAa3a3A9643',

        USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        DAI  = '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        UST  = '0xa47c8bf37f92aBed4A126BDA807A7b7498661acD',
        WBTC = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        EURS = '0xdB25f211AB05b1c97D595516F45794528a807ad8',
        LINK = '0x514910771AF9Ca656af840dff83E8264EcF986CA';

        const 
            CurveSwapBaseCurrency =   WETH,
            OneInchSwapBaseCurrency = WETH;
    
    return {
        UniSwap, SushiSwap, CurveSwap, OneInchSwap,
        CurveSwapBaseCurrency, OneInchSwapBaseCurrency,
        USDC, WETH, DAI, USDT, UST, WBTC, EURS, LINK,
        
        keyTokens: [USDC, WETH, DAI, USDT, UST, WBTC, EURS, LINK],
        pricingTokens: [USDC, WETH, DAI, USDT, WBTC, EURS],
        outputToken: USDC
    }
}

function getBSCAddresses() {
    const
        PancakeSwap = '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
        OneInchSwap = '0xD41B24bbA51fAc0E4827b6F94C0D6DDeB183cD64',

        USDC = '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
        ETH  = '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
        DAI  = '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
        USDT = '0x55d398326f99059fF775485246999027B3197955',
        UST  = '0x23396cF899Ca06c4472205fC903bDB4de249D6fC',
        BTCB = '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
        BUSD = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
        WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
        VAI  = '0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7',
        ONEINCH = '0x111111111117dC0aa78b770fA6A738034120C302';
    
    const
        OneInchSwapBaseCurrency = WBNB;

    return {
        PancakeSwap, OneInchSwap,
        OneInchSwapBaseCurrency, 
        USDC, ETH, DAI, USDT, UST, BTCB, BUSD, WBNB, VAI, ONEINCH,
        
        keyTokens: [USDC, ETH, DAI, USDT, UST, BTCB, BUSD, WBNB, VAI, ONEINCH],
        pricingTokens: [WBNB, BUSD, UST, USDT, USDC, VAI, DAI],
        outputToken: BUSD
    }
}

function getMaticAddresses() {
    const
        SushiSwap = '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
        QuickSwap = '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
        WaultSwap = '0xa98ea6356A316b44Bf710D5f9b6b4eA0081409Ef',

        WETH   = '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
        WMATIC = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
        USDC   = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        DAI    = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
        USDT   = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        WBTC   = '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6';

    return {
        SushiSwap, QuickSwap, WaultSwap,
        WETH, WMATIC, USDC, DAI, USDT, WBTC,
        
        keyTokens: [WMATIC, USDC, DAI, USDT, WBTC, WETH],
        pricingTokens: [WMATIC, USDC, DAI, USDT, WBTC, WETH],
        outputToken: USDC     
    }
}        

const addressBook = {
    mainnet: getMainNetAddresses(),
    bsc: getBSCAddresses(),
    matic: getMaticAddresses()
}
module.exports = addressBook;