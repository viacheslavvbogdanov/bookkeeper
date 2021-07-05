// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/proxy/Initializable.sol";

import "./Governable.sol";
import "./SwapBase.sol";

import "hardhat/console.sol";
import "./UniSwap.sol";

pragma solidity 0.6.12;

abstract contract OracleBase is Governable, Initializable  {

  using SafeERC20 for IERC20;
  using Address for address;
  using SafeMath for uint256;

  uint256 public precisionDecimals = 18;

  //The defined output token is the unit in which prices of input tokens are given.
  address public definedOutputToken = address(0);

  //Key tokens are used to find liquidity for any given token on Uni, Sushi and Curve.
  address[] public keyTokens;

  //Pricing tokens are Key tokens with good liquidity with the defined output token on Uniswap.
  address[] public pricingTokens;

  mapping(address => address) replacementTokens;

  SwapBase[] public swaps;

  modifier validKeyToken(address keyToken){
      require(checkKeyToken(keyToken), "Not a Key Token");
      _;
  }
  modifier validPricingToken(address pricingToken){
      require(checkPricingToken(pricingToken), "Not a Pricing Token");
      _;
  }

  event RegistryChanged(address newRegistry, address oldRegistry);
  event KeyTokenAdded(address newKeyToken);
  event PricingTokenAdded(address newPricingToken);
  event KeyTokenRemoved(address keyToken);
  event PricingTokenRemoved(address pricingToken);
  event DefinedOutputChanged(address newOutputToken, address oldOutputToken);

  constructor(address _storage) Governable(_storage) public {
    initialize(_storage); //TODO remove in proxy version?
  }

  function initialize(address _storage) public virtual initializer {
    setStorage(_storage);
    // at inherited contract you have to initialize:
    // - swaps array
    // - definedOutputToken address
    // - keyTokens[]
    // - pricingTokens[]
  }

  function addKeyToken(address newToken) external onlyGovernance {
    require((checkKeyToken(newToken)==false), "Already a key token");
    keyTokens.push(newToken);
    emit KeyTokenAdded(newToken);
  }
  function addPricingToken(address newToken) public onlyGovernance validKeyToken(newToken) {
    require((checkPricingToken(newToken)==false), "Already a pricing token");
    pricingTokens.push(newToken);
    emit PricingTokenAdded(newToken);
  }

  function removeKeyToken(address keyToken) external onlyGovernance validKeyToken(keyToken) {
    uint256 i;
    for ( i=0;i<keyTokens.length;i++) {
      if (keyToken == keyTokens[i]){
        break;
      }
    }
    while (i<keyTokens.length-1) {
      keyTokens[i] = keyTokens[i+1];
      i++;
    }
    keyTokens.pop();
    emit KeyTokenRemoved(keyToken);

    if (checkPricingToken(keyToken)) {
      removePricingToken(keyToken);
    }
  }
  function removePricingToken(address pricingToken) public onlyGovernance validPricingToken(pricingToken) {
    uint256 i;
    for (i=0;i<pricingTokens.length;i++) {
      if (pricingToken == pricingTokens[i]){
        break;
      }
    }
    while (i<pricingTokens.length-1) {
      pricingTokens[i] = pricingTokens[i+1];
      i++;
    }
    pricingTokens.pop();
    emit PricingTokenRemoved(pricingToken);
  }
  function changeDefinedOutput(address newOutputToken) external onlyGovernance validKeyToken(newOutputToken) {
    address oldOutputToken = definedOutputToken;
    definedOutputToken = newOutputToken;
    emit DefinedOutputChanged(newOutputToken, oldOutputToken);
  }
  function modifyReplacementTokens(address _inputToken, address _replacementToken) external onlyGovernance {
    replacementTokens[_inputToken] = _replacementToken;
  }

  //Main function of the contract. Gives the price of a given token in the defined output token.
  //The contract allows for input tokens to be LP tokens from Uniswap, Sushiswap, Curve and 1Inch.
  //In case of LP token, the underlying tokens will be found and valued to get the price.
  function getPrice(address token) external view returns (uint256) {
    if (token == definedOutputToken)
      return (10**precisionDecimals);

    // if the token exists in the mapping, we'll swap it for the replacement
    // example btcb/renbtc pool -> btcb
    if (replacementTokens[token] != address(0)) {
      token = replacementTokens[token];
    }

    uint256 tokenPrice;
    uint256 tokenValue;
    uint256 price = 0;
    uint256 i;
    (bool swapFound, SwapBase swap) = getSwapForPool(token);
    if (swapFound) {
      (address[] memory tokens, uint256[] memory amounts) = swap.getUnderlying(token);
      for (i=0;i<tokens.length;i++) {
        if (tokens[i] == address(0)) break;
        tokenPrice = computePrice(tokens[i]);
        if (tokenPrice == 0) return 0;
        tokenValue = tokenPrice *amounts[i]/10**precisionDecimals;
        price += tokenValue;
      }
      return price;
    } else {
      return computePrice(token);
    }
  }

  function getSwapForPool(address token) public view returns(bool, SwapBase) {
    for (uint i=0; i<swaps.length; i++ ) {
      if (swaps[i].isPool(token)) {
        return (true, swaps[i]);
      }
    }
    return (false, swaps[0]); //TODO find better way to handle result when swap is not found
  }

  //General function to compute the price of a token vs the defined output token.
  function computePrice(address token) public view returns (uint256) {
    uint256 price;
    if (token == definedOutputToken) {
      price = 10**precisionDecimals;
    } else if (token == address(0)) {
      price = 0;
    } else {
      (SwapBase swap, address keyToken, address pool) = getLargestPool(token,keyTokens);
      uint256 priceVsKeyToken;
      uint256 keyTokenPrice;
      if (keyToken == address(0)) {
        price = 0;
      } else {
        priceVsKeyToken = swap.getPriceVsToken(token,keyToken,pool);
        keyTokenPrice = getKeyTokenPrice(keyToken);
        price = priceVsKeyToken*keyTokenPrice/10**precisionDecimals;
      }
    }
    return (price);
  }

  //Checks the results of the different largest pool functions and returns the largest.
  function getLargestPool(address token, address[] memory tokenList) public view returns (SwapBase, address, address) {
    address largestKeyToken = address(0);
    address largestPool = address(0);
    uint largestPoolSize = 0;
    SwapBase largestSwap;
    for (uint i=0;i<swaps.length;i++) {
      SwapBase swap = swaps[i];
      (address swapLargestKeyToken, address swapLargestPool, uint swapLargestPoolSize) = swap.getLargestPool(token, tokenList);
      if (swapLargestPoolSize>largestPoolSize) {
        largestSwap = swap;
        largestKeyToken = swapLargestKeyToken;
        largestPool = swapLargestPool;
        largestPoolSize = swapLargestPoolSize;
      }
    }
    return (largestSwap, largestKeyToken, largestPool);
  }


  //Gives the price of a given keyToken.
  function getKeyTokenPrice(address token) internal view returns (uint256) {
    bool isPricingToken = checkPricingToken(token);
    uint256 price;
    uint256 priceVsPricingToken;
    if (token == definedOutputToken) {
      price = 10**precisionDecimals;
    } else if (isPricingToken) {
      price = swaps[0].getPriceVsToken(token, definedOutputToken, address(0)); // first swap is used
      // as at original contract was used
      // mainnet: UniSwap OracleMainnet_old.sol:641
      // bsc: Pancake OracleBSC_old.sol:449
    } else {
      uint256 pricingTokenPrice;
      (SwapBase swap, address pricingToken, address pricingPool) = getLargestPool(token,pricingTokens);
      priceVsPricingToken = swap.getPriceVsToken(token, pricingToken, pricingPool);
//      pricingTokenPrice = (pricingToken == definedOutputToken)? 10**precisionDecimals : swap.getPriceVsToken(pricingToken,definedOutputToken,pricingPool);
      // Like in original contract we use UniSwap - it must be first swap at the list (swaps[0])
      // See OracleMainnet_old.js:634, OracleBSC_old.sol:458
      //TODO improve this part?
      pricingTokenPrice = (pricingToken == definedOutputToken)? 10**precisionDecimals : swaps[0].getPriceVsToken(pricingToken,definedOutputToken,pricingPool);
      price = priceVsPricingToken*pricingTokenPrice/10**precisionDecimals;
    }
    return price;
  }

  //Checks if a given token is in the pricingTokens list.
  function checkPricingToken(address token) public view returns (bool) {
    uint256 i;
    for (i=0;i<pricingTokens.length;i++) {
      if (token == pricingTokens[i]) {
        return true;
      }
    }
    return false;
  }

  //Checks if a given token is in the keyTokens list.
  function checkKeyToken(address token) public view returns (bool) {
    uint256 i;
    for (i=0;i<keyTokens.length;i++) {
      if (token == keyTokens[i]) {
        return true;
      }
    }
    return false;
  }
}
