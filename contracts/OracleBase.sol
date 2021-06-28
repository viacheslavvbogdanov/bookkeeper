// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/proxy/Initializable.sol";

import "./Governable.sol";
import "./SwapBase.sol";

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
  event CurveExceptionAdded(address newException, uint256 exceptionList);
  event CurveExceptionRemoved(address oldException, uint256 exceptionList);

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


  //Main function of the contract. Gives the price of a given token in the defined output token.
  //The contract allows for input tokens to be LP tokens from Uniswap, Sushiswap, Curve and 1Inch.
  //In case of LP token, the underlying tokens will be found and valued to get the price.
  function getPrice(address token) external view returns (uint256) {
    //TODO swaps array iteration
    if (token == definedOutputToken) {
      return (10**precisionDecimals);
    }
    bool uniSushiLP;
    bool curveLP;
    bool oneInchLP;
    (uniSushiLP, curveLP, oneInchLP) = isLPCheck(token);
    uint256 priceToken;
    uint256 tokenValue;
    uint256 price;
    uint256 i;
    if (uniSushiLP || oneInchLP) {
      address[2] memory tokens;
      uint256[2] memory amounts;
      (tokens, amounts) = (uniSushiLP)? getUniUnderlying(token):getOneInchUnderlying(token);
      for (i=0;i<2;i++) {
        priceToken = computePrice(tokens[i]);
        if (priceToken == 0) {
          price = 0;
          return price;
        }
        tokenValue = priceToken*amounts[i]/10**precisionDecimals;
        price = price + tokenValue;
      }
      return price;
    } else if (curveLP) {
      address[8] memory tokens;
      uint256[8] memory amounts;
      (tokens, amounts) = getCurveUnderlying(token);
      for (i=0;i<tokens.length;i++) {
        if (tokens[i] == address(0)) {
          break;
        }
        priceToken = computePrice(tokens[i]);
        if (priceToken == 0) {
          price = 0;
          return price;
        }
        tokenValue = priceToken*amounts[i]/10**precisionDecimals;
        price = price + tokenValue;
      }
      return price;
    } else {
      return computePrice(token);
    }
  }

  function isLPCheck(address token) public view returns(bool, bool, bool) {
    //TODO iterate swaps array and call isPool, if found, return true and index pool
    bool isOneInch = isOneInchCheck(token);
    bool isUniSushi = isUniSushiCheck(token);
    bool isCurve = isCurveCheck(token);
    return (isUniSushi, isCurve, isOneInch);
  }


  //General function to compute the price of a token vs the defined output token.
  function computePrice(address token) public view returns (uint256) {
    //TODO swaps array
    uint256 price;
    if (token == definedOutputToken) {
      price = 10**precisionDecimals;
    } else if (token == address(0)) {
      price = 0;
    } else {
      (address keyToken, address pool, bool uni, bool sushi) = getLargestPool(token,keyTokens);
      uint256 priceVsKeyToken;
      uint256 keyTokenPrice;
      if (keyToken == address(0)) {
        price = 0;
      } else if (uni) {
        priceVsKeyToken = getPriceVsTokenUni(token,keyToken);
        keyTokenPrice = getKeyTokenPrice(keyToken);
        price = priceVsKeyToken*keyTokenPrice/10**precisionDecimals;
      } else if (sushi) {
        priceVsKeyToken = getPriceVsTokenSushi(token,keyToken);
        keyTokenPrice = getKeyTokenPrice(keyToken);
        price = priceVsKeyToken*keyTokenPrice/10**precisionDecimals;
      } else {
        priceVsKeyToken = getPriceVsTokenCurve(token,keyToken,pool);
        keyTokenPrice = getKeyTokenPrice(keyToken);
        price = priceVsKeyToken*keyTokenPrice/10**precisionDecimals;
      }
    }
    return (price);
  }

  //Checks the results of the different largest pool functions and returns the largest.
  function getLargestPool(address token, address[] memory tokenList) public view returns (address, address, bool, bool) {
    //TODO swaps array
    (address uniSushiKeyToken, uint256 uniSushiLiquidity, bool isUni) = getUniSushiLargestPool(token, tokenList);
    (address curveKeyToken, address curvePool, uint256 curveLiquidity) = getCurveLargestPool(token, tokenList);
    if (uniSushiLiquidity > curveLiquidity) {
      bool isSushi = (isUni)? false:true;
      return (uniSushiKeyToken, address(0), isUni, isSushi);
    } else {
      return (curveKeyToken, curvePool, false, false);
    }
  }


  //Gives the price of a given keyToken.
  function getKeyTokenPrice(address token) internal view returns (uint256) {
    //TODO swaps array iterate
    bool isPricingToken = checkPricingToken(token);
    uint256 price;
    uint256 priceVsPricingToken;
    if (token == definedOutputToken) {
      price = 10**precisionDecimals;
    } else if (isPricingToken) {
      price = getPriceVsTokenUni(token,definedOutputToken);
    } else {
      uint256 pricingTokenPrice;
      (address pricingToken, address pricingPool, bool uni, bool sushi) = getLargestPool(token,pricingTokens);
      if (uni) {
        priceVsPricingToken = getPriceVsTokenUni(token,pricingToken);
      } else if (sushi) {
        priceVsPricingToken = getPriceVsTokenSushi(token,pricingToken);
      } else {
        priceVsPricingToken = getPriceVsTokenCurve(token,pricingToken,pricingPool);
      }
      pricingTokenPrice = (pricingToken == definedOutputToken)? 10**precisionDecimals:getPriceVsTokenUni(pricingToken,definedOutputToken);
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
