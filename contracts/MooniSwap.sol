// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./Governable.sol";

import "./interface/mooniswap/IMooniFactory.sol";
import "./interface/mooniswap/IMooniswap.sol";
import "./SwapBase.sol";

pragma solidity 0.6.12;

abstract contract MooniSwap is SwapBase {

  IMooniFactory oneInchFactory;

  constructor(address _factoryAddress, address _storage) SwapBase(_factoryAddress, _storage) public {

  }

  function initializeFactory() public virtual;

  function changeFactory(address newFactory) external onlyGovernance {
    address oldFactory = factoryAddress;
    factoryAddress = newFactory;
    if (factoryAddress!=address(0)) initializeFactory();
    emit FactoryChanged(newFactory, oldFactory);
  }

  /// @dev  Check what token is pool of this Swap
  function isPool(address token) public virtual view returns(bool){
    return oneInchFactory.isPool(token);
  }

  /// @dev  Get underlying tokens and amounts
  function getUnderlying(address token) public virtual view returns (address[] memory, uint256[] memory){
    IMooniswap pair = IMooniswap(token);
    address[2] memory tokens;
    uint256[2] memory amounts;
    tokens[0] = pair.token0();
    tokens[1] = pair.token1();
    uint256 token0Decimals = (tokens[0]==address(0))? 18:ERC20(tokens[0]).decimals();
    uint256 token1Decimals = ERC20(tokens[1]).decimals();
    uint256 supplyDecimals = ERC20(token).decimals();
    uint256 reserve0 = pair.getBalanceForRemoval(tokens[0]);
    uint256 reserve1 = pair.getBalanceForRemoval(tokens[1]);
    uint256 totalSupply = pair.totalSupply();
    if (reserve0 == 0 || reserve1 == 0 || totalSupply == 0) {
      amounts[0] = 0;
      amounts[1] = 0;
      return (tokens, amounts);
    }
    amounts[0] = reserve0*10**(supplyDecimals-token0Decimals+precisionDecimals)/totalSupply;
    amounts[1] = reserve1*10**(supplyDecimals-token1Decimals+precisionDecimals)/totalSupply;

    //1INCH uses ETH, instead of WETH in pools. For further calculations we continue with WETH instead.
    //ETH will always be the first in the pair, so no need to check tokens[1]
    if (tokens[0] == address(0)) {
      tokens[0] = WETH;
    }
    return (tokens, amounts);
  }

  /// @dev Returns pool size
  function getPoolSize(address pairAddress, address token) public virtual view returns(uint256);

  /// @dev Gives a pool with largest liquidity for a given token and a given tokenset (either keyTokens or pricingTokens)
  function getLargestPool(address token, address[] memory tokenList) internal view returns (address, address, uint256);
  // return (largestKeyToken, largestPoolAddress, largestPoolSize);

  /// @dev Gives the balance of a given token in a given pool.
  function getBalance(address tokenFrom, address tokenTo, address pool) internal view returns (uint256);

  /// @dev Generic function giving the price of a given token vs another given token
  function getPriceVsToken(address token0, address token1) internal view returns (uint256) ;

}
