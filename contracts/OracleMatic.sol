// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/utils/Address.sol";
import "./Governable.sol";
import "./OracleBase.sol";
import "./SwapBase.sol";
import "./UniSwap.sol";

pragma solidity 0.6.12;

contract OracleMatic is OracleBase {

  using Address for address;

  constructor(address _storage) OracleBase(_storage) public {
  }

  function initialize(address _storage) public virtual override initializer {
    super.initialize(_storage);

    address WETH   = 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619;
    address WMATIC = 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270;
    address USDC   = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174;
    address DAI    = 0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063;
    address USDT   = 0xc2132D05D31c914a87C6611C10748AEb04B58e8F;
    address WBTC   = 0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6;

    //Key tokens are used to find liquidity for any given token on Uni, Sushi and Curve.
    keyTokens = [ WMATIC, USDC, DAI, USDT, WBTC, WETH ];

    //Pricing tokens are Key tokens with good liquidity with the defined output token on Uniswap.
    pricingTokens = [ WMATIC, USDC, DAI, USDT, WBTC, WETH ];

    //The defined output token is the unit in which prices of input tokens are given.
    definedOutputToken = USDC;

    //Addresses for factories and registries for different DEX platforms.
    address quickswapFactoryAddress = 0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32;
    address sushiswapFactoryAddress = 0xc35DADB65012eC5796536bD9864eD8773aBc74C4;

    swaps = [ // In priority order: from largest to smallest
      SwapBase( new UniSwap( sushiswapFactoryAddress, _storage) ),
      SwapBase( new UniSwap( quickswapFactoryAddress, _storage) )
    ];

  }

}
