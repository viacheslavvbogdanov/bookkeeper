// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

interface IOracleBase  {

  event RegistryChanged(address newRegistry, address oldRegistry);
  event KeyTokenAdded(address newKeyToken);
  event PricingTokenAdded(address newPricingToken);
  event SwapAdded(address newSwap);
  event KeyTokenRemoved(address keyToken);
  event PricingTokenRemoved(address pricingToken);
  event SwapRemoved(address newSwap);
  event DefinedOutputChanged(address newOutputToken, address oldOutputToken);

  function initialize(address[] memory _keyTokens, address[] memory _pricingTokens, address _outputToken) external;

  function addSwap(address newSwap) external;
  function addSwaps(address[] memory newSwaps) external;
  function setSwaps(address[] memory newSwaps) external;
  function removeSwap(address swap) external;

  function addKeyToken(address newToken) external;
  function addKeyTokens(address[] memory newTokens) external;
  function removeKeyToken(address keyToken) external;

  function addPricingToken(address newToken) external;
  function addPricingTokens(address[] memory newTokens) external;
  function removePricingToken(address pricingToken) external;

  function changeDefinedOutput(address newOutputToken) external;
  function modifyReplacementTokens(address _inputToken, address _replacementToken) external;

  //Main function of the contract. Gives the price of a given token in the defined output token.
  //The contract allows for input tokens to be LP tokens from Uniswap, Sushiswap, Curve and 1Inch.
  //In case of LP token, the underlying tokens will be found and valued to get the price.
  function getPrice(address token) external view returns (uint256);

  function getSwapForPool(address token) external view returns(address);

  //General function to compute the price of a token vs the defined output token.
  function computePrice(address token) external view returns (uint256);

  //Checks the results of the different largest pool functions and returns the largest.
  function getLargestPool(address token) external view returns (address, address, address);
  function getLargestPool(address token, address[] memory keyTokenList) external view returns (address, address, address);

  //Checks if a given token is in the pricingTokens list.
  function checkPricingToken(address token) external view returns (bool);

  //Checks if a given token is in the keyTokens list.
  function checkKeyToken(address token) external view returns (bool);

  //Checks if a given address is in the swaps list.
  function checkSwap(address swap) external view returns (bool);
}
