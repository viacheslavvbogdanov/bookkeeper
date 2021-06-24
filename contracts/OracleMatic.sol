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
    uniswapFactoryAddress   = 0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32;  //QUICK swap address
    sushiswapFactoryAddress = 0xc35DADB65012eC5796536bD9864eD8773aBc74C4;

    initializeFactories();

    WETH = 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619; //WETH

    address WMATIC = 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270; //WMATIC
    address USDC   = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174; //USDC
    address DAI    = 0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063; //DAI
    address USDT   = 0xc2132D05D31c914a87C6611C10748AEb04B58e8F; //USDT
    address WBTC   = 0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6; //WBTC

    //Key tokens are used to find liquidity for any given token on Uni, Sushi and Curve.
    keyTokens = [ WMATIC, USDC, DAI, USDT, WBTC ];

    //Pricing tokens are Key tokens with good liquidity with the defined output token on Uniswap.
    pricingTokens = [ WMATIC, USDC, DAI, USDT, WBTC ];

    //The defined output token is the unit in which prices of input tokens are given.
    definedOutputToken = USDC;

  }

}
