// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/utils/Address.sol";
import "./Governable.sol";
import "./OracleBase.sol";
import "./SwapBase.sol";
import "./UniSwap.sol";
import "./CurveSwap.sol";
import "./OneInchSwap.sol";

pragma solidity 0.6.12;

contract OracleMainnet is OracleBase {

  using Address for address;

  constructor(address _storage) OracleBase(_storage) public {
  }

  function initialize(address _storage) public virtual override initializer {
    super.initialize(_storage);

    address USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address DAI  = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7;
    address UST  = 0xa47c8bf37f92aBed4A126BDA807A7b7498661acD;
    address WBTC = 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599;
    address EURS = 0xdB25f211AB05b1c97D595516F45794528a807ad8;
    address LINK = 0x514910771AF9Ca656af840dff83E8264EcF986CA;

    //Key tokens are used to find liquidity for any given token on Uni, Sushi and Curve.
    keyTokens = [ USDC, WETH, DAI, USDT, UST, WBTC, EURS, LINK ];
    
    //Pricing tokens are Key tokens with good liquidity with the defined output token on Uniswap.
    pricingTokens = [ USDC, WETH, DAI, USDT, WBTC, EURS ];

    //The defined output token is the unit in which prices of input tokens are given.
    definedOutputToken = USDC;

    UniSwap uniswapFactory     = new UniSwap(     0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f, _storage);
    UniSwap sushiswapFactory   = new UniSwap(     0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac, _storage);
    CurveSwap curveRegistry    = new CurveSwap(   0x7D86446dDb609eD0F5f8684AcF30380a356b2B4c, _storage, WETH, this);
    OneInchSwap oneInchFactory = new OneInchSwap( 0xbAF9A5d4b0052359326A6CDAb54BABAa3a3A9643, _storage, WETH);

    swaps = [
      SwapBase(uniswapFactory), // Primary swap, used in getKeyTokenPrice
      SwapBase(sushiswapFactory),
      SwapBase(curveRegistry),
      SwapBase(oneInchFactory)
    ];

  }

}
