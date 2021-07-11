// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

interface ISwapBase  {

  uint256 public PRECISION_DECIMALS;

  address factoryAddress;

  event FactoryChanged(address newFactory, address oldFactory);

  function changeFactory(address newFactory) external;

  /// @dev Check what token is pool of this Swap
  function isPool(address token) public view returns(bool);

  /// @dev Get underlying tokens and amounts
  function getUnderlying(address token) public view returns (address[] memory, uint256[] memory);

  /// @dev Gives a pool with largest liquidity for a given token and a given tokenset (either keyTokens or pricingTokens)
  function getLargestPool(address token, address[] memory tokenList) public view returns (address, address, uint256);
  // return (largestKeyToken, largestPoolAddress, largestPoolSize);

  /// @dev Generic function giving the price of a given token vs another given token
  function getPriceVsToken(address token0, address token1, address poolAddress) public view returns (uint256) ;

}
