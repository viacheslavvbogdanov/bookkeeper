// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

interface IOracleBase  {

  uint256 public constant PRECISION_DECIMALS;
  uint256 public constant ONE;

  //The defined output token is the unit in which prices of input tokens are given.
  address public definedOutputToken;

  //Key tokens are used to find liquidity for any given token on Uni, Sushi and Curve.
  address[] public keyTokens;

  //Pricing tokens are Key tokens with good liquidity with the defined output token on Uniswap.
  address[] public pricingTokens;

  mapping(address => address) replacementTokens;

  //Swap platforms addresses
  address[] public swaps;

  event RegistryChanged(address newRegistry, address oldRegistry);
  event KeyTokenAdded(address newKeyToken);
  event PricingTokenAdded(address newPricingToken);
  event SwapAdded(address newSwap);
  event KeyTokenRemoved(address keyToken);
  event PricingTokenRemoved(address pricingToken);
  event SwapRemoved(address newSwap);
  event DefinedOutputChanged(address newOutputToken, address oldOutputToken);


  function initialize(address _storage, address[] memory _keyTokens, address[] memory _pricingTokens, address _outputToken) public;

  function addSwap(address newSwap) public;
  function addSwaps(address[] memory newSwaps) public;
  function setSwaps(address[] memory newSwaps) external;
  function removeSwap(address swap) public;

  function addKeyToken(address newToken) public;
  function addKeyTokens(address[] memory newTokens) public;
  function removeKeyToken(address keyToken) external;

  function addPricingToken(address newToken) public;
  function addPricingTokens(address[] memory newTokens) public;
  function removePricingToken(address pricingToken) public;

  function changeDefinedOutput(address newOutputToken) public;
  function modifyReplacementTokens(address _inputToken, address _replacementToken) external;

  //Main function of the contract. Gives the price of a given token in the defined output token.
  //The contract allows for input tokens to be LP tokens from Uniswap, Sushiswap, Curve and 1Inch.
  //In case of LP token, the underlying tokens will be found and valued to get the price.
  function getPrice(address token) external view returns (uint256);

  function getSwapForPool(address token) public view returns(address);

  //General function to compute the price of a token vs the defined output token.
  function computePrice(address token) public view returns (uint256);

  //Checks the results of the different largest pool functions and returns the largest.
  function getLargestPool(address token, address[] memory keyTokenList) public view returns (address, address, address);

  //Checks if a given token is in the pricingTokens list.
  function checkPricingToken(address token) public view returns (bool);

  //Checks if a given token is in the keyTokens list.
  function checkKeyToken(address token) public view returns (bool);

  //Checks if a given address is in the swaps list.
  function checkSwap(address swap) public view returns (bool);
}
