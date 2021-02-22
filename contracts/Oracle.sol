import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./interface/uniswap/IUniswapV2Factory.sol";
import "./interface/uniswap/IUniswapV2Pair.sol";
import "./interface/curve/ICurvePool.sol";
import "./interface/curve/ICurveRegistry.sol";
import "./interface/mooniswap/IMooniFactory.sol";
import "./interface/mooniswap/IMooniswap.sol";
import "./Storage.sol";
import "./Governable.sol";

pragma solidity 0.6.12;

contract Oracle is Governable {

  using SafeERC20 for IERC20;
  using Address for address;
  using SafeMath for uint256;

  //Addresses for factories and registries for different DEX platforms. Functions will be added to allow to alter these when needed.
  address public uniswapFactoryAddress = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
  address public sushiswapFactoryAddress = 0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac;
  address public curveRegistryAddress = 0x7D86446dDb609eD0F5f8684AcF30380a356b2B4c;
  address public oneInchFactoryAddress = 0xbAF9A5d4b0052359326A6CDAb54BABAa3a3A9643;
  uint256 public precisionDecimals = 18;

  IUniswapV2Factory uniswapFactory = IUniswapV2Factory(uniswapFactoryAddress);
  IUniswapV2Factory sushiswapFactory = IUniswapV2Factory(sushiswapFactoryAddress);
  ICurveRegistry curveRegistry = ICurveRegistry(curveRegistryAddress);
  IMooniFactory oneInchFactory = IMooniFactory(oneInchFactoryAddress);

  //Key tokens are used to find liquidity for any given token on Uni, Sushi and Curve.
  address[] public keyTokens = [
  0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48, //USDC
  0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, //WETH
  0x6B175474E89094C44Da98b954EedeAC495271d0F, //DAI
  0xdAC17F958D2ee523a2206206994597C13D831ec7, //USDT
  0xa47c8bf37f92aBed4A126BDA807A7b7498661acD, //UST
  0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599, //WBTC
  0xdB25f211AB05b1c97D595516F45794528a807ad8  //EURS
  ];
  //Pricing tokens are Key tokens with good liquidity with the defined output token on Uniswap.
  address[] public pricingTokens = [
  0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48, //USDC
  0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, //WETH
  0x6B175474E89094C44Da98b954EedeAC495271d0F, //DAI
  0xdAC17F958D2ee523a2206206994597C13D831ec7, //USDT
  0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599, //WBTC
  0xdB25f211AB05b1c97D595516F45794528a807ad8  //EURS
  ];
  //The defined output token is the unit in which prices of input tokens are given.
  address public definedOutputToken = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; //USDC

  //Below are addresses of LP tokens for which it is known that the get_underlying functions of Curve Registry do not work because of errors in the Curve contract.
  //The exceptions are split. In the first exception the get_underlying_coins is called with get_balances.
  //In the second exception get_coins and get_balances are called.
  address[] public curveExceptionList0 = [
  0xFd2a8fA60Abd58Efe3EeE34dd494cD491dC14900,
  0x02d341CcB60fAaf662bC0554d13778015d1b285C
  ];
  address[] public curveExceptionList1 = [
  0x49849C98ae39Fff122806C06791Fa73784FB3675,
  0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3,
  0xaA17A236F2bAdc98DDc0Cf999AbB47D47Fc0A6Cf
  ];

  event Check(string);

  constructor(address _storage)
  Governable(_storage) public {}

  //Main function of the contract. Gives the price of a given token in the defined output token.
  //The contract allows for input tokens to be LP tokens from Uniswap, Sushiswap, Curve and 1Inch.
  //In case of LP token, the underlying tokens will be found and valued to get the price.
  function getPrice(address token) external view returns (uint256) {
    if (token == definedOutputToken) {
      return (10**precisionDecimals);
    }
    bool uniSushiLP;
    bool curveLP;
    bool oneInchLP;
    (uniSushiLP, curveLP, oneInchLP) = isLPCheck(token);
    if (uniSushiLP || oneInchLP) {
      address[2] memory tokens;
      uint256[2] memory amounts;
      if (uniSushiLP) {
        (tokens, amounts) = getUniUnderlying(token);
      } else {
        (tokens, amounts) = getOneInchUnderlying(token);
      }
      uint256 priceToken;
      uint256 tokenValue;
      uint256 price = 0;
      uint256 i;
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
      uint256 priceToken;
      uint256 tokenValue;
      uint256 price = 0;
      uint256 i;
      for (i=0;i<tokens.length;i++) {
        if (tokens[i] == address(0)) {
          break;
          } else {
          priceToken = computePrice(tokens[i]);
          if (priceToken == 0) {
            price = 0;
            return price;
          }
          tokenValue = priceToken*amounts[i]/10**precisionDecimals;
        }
        price = price + tokenValue;
      }
      return price;
    } else {
      uint256 price = computePrice(token);
      return price;
    }
  }

  function isLPCheck(address token) public view returns(bool, bool, bool) {
    bool isOneInch = isOneInchCheck(token);
    bool isUniSushi = isUniCheck(token) || isSushiCheck(token);
    bool isCurve = isCurveCheck(token);
    return (isUniSushi, isCurve, isOneInch);
  }

  //Checks if address is 1Inch LP
  function isOneInchCheck(address token) public view returns (bool) {
    bool oneInchLP = oneInchFactory.isPool(token);
    return oneInchLP;
  }

  //Checks if address is Uni LP. This is done in two steps, because the second step seems to cause errors for some tokens.
  //Only the first step is not deemed accurate enough, as any token could be caalled UNI-V2.
  function isUniCheck(address token) public view returns (bool) {
    IUniswapV2Pair pair = IUniswapV2Pair(token);
    string memory uniSymbol = "UNI-V2";
    try pair.symbol() returns (string memory symbol) {
      if (keccak256(abi.encodePacked(symbol)) != keccak256(abi.encodePacked(uniSymbol))) {
        return false;
      }
    } catch {
      return false;
    }
    try pair.factory.gas(3000)() returns (address factory) {
      if (factory == uniswapFactoryAddress){
        return true;
      } else {
        return false;
      }
    } catch {
      return false;
    }
  }

  //Checks if address is Sushi LP.
  function isSushiCheck(address token) public view returns (bool) {
    IUniswapV2Pair pair = IUniswapV2Pair(token);
    string memory sushiSymbol = "SLP";
    try pair.symbol() returns (string memory symbol) {
      if (keccak256(abi.encodePacked(symbol)) != keccak256(abi.encodePacked(sushiSymbol))) {
        return false;
      }
    } catch {
      return false;
    }
    try pair.factory.gas(3000)() returns (address factory) {
      if (factory == sushiswapFactoryAddress){
        return true;
      } else {
        return false;
      }
    } catch {
      return false;
    }
  }

  //Checks if address is Curve LP
  function isCurveCheck(address token) public view returns (bool) {
    address pool = curveRegistry.get_pool_from_lp_token(token);
    if (pool != address(0)) {
      return true;
    } else {
      return false;
    }
  }

  //Get underlying tokens and amounts for Uni/Sushi LPs
  function getUniUnderlying(address token) public view returns (address[2] memory, uint256[2] memory) {
    IUniswapV2Pair pair = IUniswapV2Pair(token);
    address[2] memory tokens;
    uint256[2] memory amounts;
    tokens[0] = pair.token0();
    tokens[1] = pair.token1();
    uint256 token0Decimals = ERC20(tokens[0]).decimals();
    uint256 token1Decimals = ERC20(tokens[1]).decimals();
    uint256 supplyDecimals = ERC20(token).decimals();
    (uint256 reserve0, uint256 reserve1, uint32 unused) = pair.getReserves();
    uint256 totalSupply = pair.totalSupply();
    if (reserve0 == 0 || reserve1 == 0 || totalSupply == 0) {
      amounts[0] = 0;
      amounts[1] = 0;
      return (tokens, amounts);
    }
    amounts[0] = reserve0*10**(supplyDecimals-token0Decimals+precisionDecimals)/totalSupply;
    amounts[1] = reserve1*10**(supplyDecimals-token1Decimals+precisionDecimals)/totalSupply;
    return (tokens, amounts);
  }

  //Get underlying tokens and amounts for 1Inch LPs
  function getOneInchUnderlying(address token) public view returns (address[2] memory, uint256[2] memory) {
    IMooniswap pair = IMooniswap(token);
    address[2] memory tokens;
    uint256[2] memory amounts;
    tokens[0] = pair.token0();
    tokens[1] = pair.token1();
    uint256 token0Decimals;
    if (tokens[0]==address(0)) {
      token0Decimals = 18;
    } else {
      token0Decimals = ERC20(tokens[0]).decimals();
    }
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
      tokens[0] = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    }
    return (tokens, amounts);
  }

  //Get underlying tokens and amounts for Curve LPs. Curve gives responses in arrays with length 8. There is no need to change their size.
  function getCurveUnderlying(address token) public view returns (address[8] memory, uint256[8] memory) {
    address pool = curveRegistry.get_pool_from_lp_token(token);
    (bool exception0, bool exception1) = checkCurveException(token);
    address[8] memory tokens;
    uint256[8] memory reserves;
    if (exception0) {
      tokens = curveRegistry.get_underlying_coins(pool);
      reserves = curveRegistry.get_balances(pool);
    } else if (exception1) {
      tokens = curveRegistry.get_coins(pool);
      reserves = curveRegistry.get_balances(pool);
    } else {
      tokens = curveRegistry.get_underlying_coins(pool);
      reserves = curveRegistry.get_underlying_balances(pool);
    }

    //Some pools work with ETH instead of WETH. For further calculations and functionality this is changed to WETH address.
    uint256[8] memory decimals;
    uint256 i;
    for (i=0;i<tokens.length;i++){
      if (tokens[i]==address(0)) {
        break;
      } else if (tokens[i]==0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE){
        decimals[i] = 18;
        tokens[i] = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
      } else {
        decimals[i] = ERC20(tokens[i]).decimals();
      }
    }
    uint256 totalSupply = IERC20(token).totalSupply();
    uint256 supplyDecimals = ERC20(token).decimals();
    uint256[8] memory amounts;
    for (i=0;i<tokens.length;i++) {
      if (tokens[i] == address(0)){
        break;
      }
      amounts[i] = reserves[i]*10**(supplyDecimals-decimals[i]+precisionDecimals)/totalSupply;
      while (amounts[i] > 10**precisionDecimals) {
        amounts[i] = amounts[i]/10;
      }
    }
    return (tokens, amounts);
  }

  //Check address for the Curve exception lists.
  function checkCurveException(address token) public view returns (bool, bool) {
    uint256 i;
    for (i=0;i<curveExceptionList0.length;i++) {
      if (token == curveExceptionList0[i]) {
        return (true, false);
      }
    }
    for (i=0;i<curveExceptionList1.length;i++) {
      if (token == curveExceptionList1[i]) {
        return (false, true);
      }
    }
    return (false, false);
  }

  //General function to compute the price of a token vs the defined output token.
  function computePrice(address token) public view returns (uint256) {
    uint256 price;
    if (token == definedOutputToken) {
      price = 10**precisionDecimals;
    } else if (token == address(0)) {
      price = 0;
    } else {
      (address keyToken, address pool, bool uni, bool sushi, bool curve) = getLargestPool(token,keyTokens);
      if (keyToken == address(0)) {
        price = 0;
      } else if (uni) {
        uint256 priceVsKeyToken = getPriceVsTokenUni(token,keyToken);
        uint256 keyTokenPrice = getKeyTokenPrice(keyToken);
        price = priceVsKeyToken*keyTokenPrice/10**precisionDecimals;
      } else if (sushi) {
        uint256 priceVsKeyToken = getPriceVsTokenSushi(token,keyToken);
        uint256 keyTokenPrice = getKeyTokenPrice(keyToken);
        price = priceVsKeyToken*keyTokenPrice/10**precisionDecimals;
      } else {
        uint256 priceVsKeyToken = getPriceVsTokenCurve(token,keyToken,pool);
        uint256 keyTokenPrice = getKeyTokenPrice(keyToken);
        price = priceVsKeyToken*keyTokenPrice/10**precisionDecimals;
      }
    }
    return (price);
  }

  //Checks the results of the different largest pool functions and returns the largest.
  function getLargestPool(address token, address[] memory tokenList) public view returns (address, address, bool, bool, bool) {
    (address uniKeyToken, uint256 uniLiquidity) = getUniLargestPool(token, tokenList);
    (address sushiKeyToken, uint256 sushiLiquidity) = getSushiLargestPool(token, tokenList);
    (address curveKeyToken, address curvePool, uint256 curveLiquidity) = getCurveLargestPool(token, tokenList);
    if (uniLiquidity > sushiLiquidity && uniLiquidity > curveLiquidity) {
      return (uniKeyToken, address(0), true, false, false);
    } else if (sushiLiquidity > curveLiquidity) {
      return (sushiKeyToken, address(0), false, true, false);
    } else {
      return (curveKeyToken, curvePool, false, false, true);
    }
  }

  //Gives the Uniswap pool with largest liquidity for a given token and a given tokenset (either keyTokens or pricingTokens)
  function getUniLargestPool(address token, address[] memory tokenList) public view returns (address, uint256) {
    uint256 largestPoolSize = 0;
    address largestPoolAddress;
    address largestKeyToken;
    uint256 poolSize;
    uint256 unused1;
    uint256 unused2;
    uint256 i;
    uint256 decimals = ERC20(token).decimals();
    for (i=0;i<tokenList.length;i++) {
      address pairAddress = uniswapFactory.getPair(token,tokenList[i]);
      if (pairAddress==address(0)) {
        continue;
      }
      IUniswapV2Pair pair = IUniswapV2Pair(pairAddress);
      address token0 = pair.token0();
      if (token == token0) {
        (poolSize, unused1, unused2) = pair.getReserves();
      } else {
        (unused1, poolSize, unused2) = pair.getReserves();
      }
      if (poolSize > largestPoolSize) {
        largestPoolSize = poolSize;
        largestKeyToken = tokenList[i];
        largestPoolAddress = pairAddress;
      }
    }
    if (largestPoolSize < 10**decimals) {
      return (address(0), 0);
    }
    return (largestKeyToken, largestPoolSize);
  }

  //Gives the Sushiswap pool with largest liquidity for a given token and a given tokenset (either keyTokens or pricingTokens)
  function getSushiLargestPool(address token, address[] memory tokenList) public view returns (address, uint256) {
    uint256 largestPoolSize = 0;
    address largestPoolAddress;
    address largestKeyToken;
    uint256 poolSize;
    uint256 unused1;
    uint256 unused2;
    uint256 i;
    uint256 decimals = ERC20(token).decimals();
    for (i=0;i<tokenList.length;i++) {
      address pairAddress = sushiswapFactory.getPair(token,tokenList[i]);
      if (pairAddress==address(0)) {
        continue;
      }
      IUniswapV2Pair pair = IUniswapV2Pair(pairAddress);
      address token0 = pair.token0();
      if (token == token0) {
        (poolSize, unused1, unused2) = pair.getReserves();
      } else {
        (unused1, poolSize, unused2) = pair.getReserves();
      }
      if (poolSize > largestPoolSize) {
        largestPoolSize = poolSize;
        largestKeyToken = tokenList[i];
        largestPoolAddress = pairAddress;
      }
    }
    if (largestPoolSize < 10**decimals) {
      return (address(0), 0);
    }
    return (largestKeyToken, largestPoolSize);
  }

  //Gives the Curve pool with largest liquidity for a given token and a given tokenset (either keyTokens or pricingTokens)
  //Curve can have multiple pools for a given pair. Research showed that the largest pool is always given as first instance, so only the first needs to be called.
  //In Curve USD based tokens are often pooled with 3Pool. In this case liquidity is the same with USDC, DAI and USDT. When liquidity is found with USDC
  //the loop is stopped, as no larger liquidity will be found with any other asset and this reduces calls.
  function getCurveLargestPool(address token, address[] memory tokenList) public view returns (address, address, uint256) {
    uint256 largestPoolSize = 0;
    address largestPoolAddress;
    address largestKeyToken;
    uint256 poolSize;
    uint256 i;
    uint256 j;
    for (i=0;i<tokenList.length;i++) {
      address poolAddress = curveRegistry.find_pool_for_coins(token, tokenList[i],0);
      if (poolAddress == address(0)) {
        continue;
      }
      address lpToken = curveRegistry.get_lp_token(poolAddress);
      (bool exception0, bool exception1) = checkCurveException(lpToken);
      if (exception0) {
        continue;
      }
      poolSize = getCurveBalance(token, tokenList[i], poolAddress);
      if (poolSize > largestPoolSize) {
        largestPoolSize = poolSize;
        largestKeyToken = tokenList[i];
        largestPoolAddress = poolAddress;
        if (largestKeyToken == 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) {
          return (largestKeyToken, largestPoolAddress, largestPoolSize);
        }
      }
    }
    return (largestKeyToken, largestPoolAddress, largestPoolSize);
  }

  //Gives the balance of a given token in a given pool.
  function getCurveBalance(address tokenFrom, address tokenTo, address pool) public view returns (uint256) {
    uint256 balance;
    (int128 indexFrom, int128 indexTo, bool underlying) = curveRegistry.get_coin_indices(pool, tokenFrom, tokenTo);
    if (underlying) {
      uint256[8] memory balances = curveRegistry.get_underlying_balances(pool);
      uint256 decimals = ERC20(tokenFrom).decimals();
      balance = balances[uint256(indexFrom)];
      if (balance > 10**(decimals+10)) {
        balance = balance*10**(decimals-18);
      }
    } else {
      uint256[8] memory balances = curveRegistry.get_balances(pool);
      balance = balances[uint256(indexFrom)];
    }
    return balance;
  }

  //Generic function giving the price of a given token vs another given token on Uniswap.
  function getPriceVsTokenUni(address token0, address token1) public view returns (uint256) {
    address pairAddress = uniswapFactory.getPair(token0,token1);
    IUniswapV2Pair pair = IUniswapV2Pair(pairAddress);
    (uint256 reserve0, uint256 reserve1, uint32 unused) = pair.getReserves();
    uint256 token0Decimals = ERC20(token0).decimals();
    uint256 token1Decimals = ERC20(token1).decimals();
    uint256 price;
    if (token0 == pair.token0()) {
      price = (reserve1*10**(token0Decimals-token1Decimals+precisionDecimals))/reserve0;
    } else {
      price = (reserve0*10**(token0Decimals-token1Decimals+precisionDecimals))/reserve1;
    }
    return price;
  }

  //Generic function giving the price of a given token vs another given token on Sushiswap.
  function getPriceVsTokenSushi(address token0, address token1) public view returns (uint256) {
    address pairAddress = sushiswapFactory.getPair(token0,token1);
    IUniswapV2Pair pair = IUniswapV2Pair(pairAddress);
    (uint256 reserve0, uint256 reserve1, uint32 unused) = pair.getReserves();
    uint256 token0Decimals = ERC20(token0).decimals();
    uint256 token1Decimals = ERC20(token1).decimals();
    uint256 price;
    if (token0 == pair.token0()) {
      price = (reserve1*10**(token0Decimals-token1Decimals+precisionDecimals))/reserve0;
    } else {
      price = (reserve0*10**(token0Decimals-token1Decimals+precisionDecimals))/reserve1;
    }
    return price;
  }

  //Generic function giving the price of a given token vs another given token on Curve.
  function getPriceVsTokenCurve(address token0, address token1, address poolAddress) public view returns (uint256) {
    ICurvePool pool = ICurvePool(poolAddress);
    (int128 indexFrom, int128 indexTo, bool underlying) = curveRegistry.get_coin_indices(poolAddress, token0, token1);
    uint256 decimals0 = ERC20(token0).decimals();
    uint256 decimals1 = ERC20(token1).decimals();
    //Accuracy is impacted when one of the tokens has low decimals.
    //This addition does not impact the outcome of computation, other than increased accuracy.
    if (decimals0 < 4 || decimals1 < 4) {
      decimals0 = decimals0 + 4;
      decimals1 = decimals1 + 4;
    }
    uint256 amount1;
    uint256 price;
    if (underlying) {
      amount1 = pool.get_dy_underlying(indexFrom, indexTo, 10**decimals0);
      price = amount1*10**(precisionDecimals-decimals1);
    } else {
      amount1 = pool.get_dy(indexFrom, indexTo, 10**decimals0);
      price = amount1*10**(precisionDecimals-decimals1);
    }
    return price;
  }

  //Gives the price of a given keyToken.
  function getKeyTokenPrice(address token) public view returns (uint256) {
    bool isPricingToken = checkPricingToken(token);
    uint256 price;
    uint256 priceVsPricingToken;
    if (token == definedOutputToken) {
      price = 10**precisionDecimals;
    } else if (isPricingToken) {
      price = getPriceVsTokenUni(token,definedOutputToken);
    } else {
      uint256 pricingTokenPrice;
      (address pricingToken, address pricingPool, bool uni, bool sushi, bool curve) = getLargestPool(token,pricingTokens);
      if (uni) {
        priceVsPricingToken = getPriceVsTokenUni(token,pricingToken);
      } else if (sushi) {
        priceVsPricingToken = getPriceVsTokenSushi(token,pricingToken);
      } else {
        priceVsPricingToken = getPriceVsTokenCurve(token,pricingToken,pricingPool);
      }
      if (pricingToken == definedOutputToken) {
        pricingTokenPrice = 10**precisionDecimals;
      } else {
        pricingTokenPrice = getPriceVsTokenUni(pricingToken,definedOutputToken);
      }
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
}
