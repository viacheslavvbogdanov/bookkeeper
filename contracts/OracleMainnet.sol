// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/utils/Address.sol";
import "./Governable.sol";
import "./OracleBase.sol";

pragma solidity 0.6.12;

contract OracleMainnet is OracleBase {

  using Address for address;

  constructor(address _storage) OracleBase(_storage) public {
  }

  function initialize(address _storage) public virtual override initializer {
    super.initialize(_storage);
  
    //Addresses for factories and registries for different DEX platforms. Functions will be added to allow to alter these when needed.
    uniswapFactoryAddress   = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
    sushiswapFactoryAddress = 0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac;
    curveRegistryAddress    = 0x7D86446dDb609eD0F5f8684AcF30380a356b2B4c;
    oneInchFactoryAddress   = 0xbAF9A5d4b0052359326A6CDAb54BABAa3a3A9643;
  
    initializeFactories();

    WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2; //WETH

    address USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; //USDC
    address DAI  = 0x6B175474E89094C44Da98b954EedeAC495271d0F; //DAI
    address USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7; //USDT
    address UST  = 0xa47c8bf37f92aBed4A126BDA807A7b7498661acD; //UST
    address WBTC = 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599; //WBTC
    address EURS = 0xdB25f211AB05b1c97D595516F45794528a807ad8; //EURS
    address LINK = 0x514910771AF9Ca656af840dff83E8264EcF986CA; //LINK

    //Key tokens are used to find liquidity for any given token on Uni, Sushi and Curve.
    keyTokens = [ USDC, WETH, DAI, USDT, UST, WBTC, EURS, LINK ];
    
    //Pricing tokens are Key tokens with good liquidity with the defined output token on Uniswap.
    pricingTokens = [ USDC, WETH, DAI, USDT, WBTC, EURS ];

    //The defined output token is the unit in which prices of input tokens are given.
    definedOutputToken = USDC;
  
    //Below are addresses of LP tokens for which it is known that the get_underlying functions of Curve Registry do not work because of errors in the Curve contract.
    //The exceptions are split. In the first exception the get_underlying_coins is called with get_balances.
    //In the second exception get_coins and get_balances are called.
    curveExceptionList0 = [
      0xFd2a8fA60Abd58Efe3EeE34dd494cD491dC14900,
      0x02d341CcB60fAaf662bC0554d13778015d1b285C
    ];
    curveExceptionList1 = [
      0x49849C98ae39Fff122806C06791Fa73784FB3675,
      0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3,
      0xaA17A236F2bAdc98DDc0Cf999AbB47D47Fc0A6Cf
    ];
  }

}
