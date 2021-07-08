// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/utils/Address.sol";
import "./Governable.sol";
import "./OracleBase.sol";
import "./SwapBase.sol";
import "./UniSwap.sol";

pragma solidity 0.6.12;

contract OracleRopsten is OracleBase {

  using Address for address;

  constructor(address _storage) OracleBase(_storage) public {
    address WETH = 0xc778417E063141139Fce010982780140Aa0cD5Ab;
    address DAI  = 0xaD6D458402F60fD3Bd25163575031ACDce07538D;
    address WBTC = 0xc3778758D19A654fA6d0bb3593Cf26916fB3d114;
    address USDC = 0xDBC941fEc34e8965EbC4A25452ae7519d6BDfc4e;

    //Key tokens are used to find liquidity for any given token on Uni, Sushi and Curve.
    keyTokens = [ WETH, DAI, WBTC, USDC ];

    //Pricing tokens are Key tokens with good liquidity with the defined output token on Uniswap.
    pricingTokens = [ WETH, DAI ];

    //The defined output token is the unit in which prices of input tokens are given.
    definedOutputToken = USDC;

    //Addresses for factories and registries for different DEX platforms.
    address uniswapFactoryAddress   = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
    address sushiswapFactoryAddress = 0xaDe0ad525430cfe17218B679483c46B6c1d63fe2;

    swaps = [ // In priority order: from largest to smallest
      address( new UniSwap( uniswapFactoryAddress,   _storage) ),
      address( new UniSwap( sushiswapFactoryAddress, _storage) )
    ];
  }

}
