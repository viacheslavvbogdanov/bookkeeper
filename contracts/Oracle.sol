import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./uniswap/interfaces/IUniswapV2Factory.sol";
import "./uniswap/interfaces/IUniswapV2Pair.sol";
import "./curve/interfaces/IRegistry.sol";
import "./mooniswap/interfaces/IMooniFactory.sol";
import "./mooniswap/interfaces/IMooniswap.sol";
import "./Storage.sol";
import "./Governable.sol";

pragma solidity 0.5.16;

contract Oracle is Governable {

  using SafeERC20 for IERC20;
  using Address for address;
  using SafeMath for uint256;

  address public uniswapFactoryAddress = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
  address public sushiswapFactoryAddress = 0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac;
  address public curveRegistryAddress = 0x7D86446dDb609eD0F5f8684AcF30380a356b2B4c;
  address public oneInchFactoryAddress = 0xbAF9A5d4b0052359326A6CDAb54BABAa3a3A9643;
  uint256 public precisionDecimals = 6;

  IUniswapV2Factory uniswapFactory = IUniswapV2Factory(uniswapFactoryAddress);
  IUniswapV2Factory sushiswapFactory = IUniswapV2Factory(sushiswapFactoryAddress);
  IRegistry curveRegistry = IRegistry(curveRegistryAddress);
  IMooniFactory oneInchFactory = IMooniFactory(oneInchFactoryAddress);

  address[] public keyTokens = [
  0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48, //USDC
  0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, //WETH
  0x6B175474E89094C44Da98b954EedeAC495271d0F, //DAI
  0xdAC17F958D2ee523a2206206994597C13D831ec7, //USDT
  0xa47c8bf37f92aBed4A126BDA807A7b7498661acD  //UST
  ];
  address[] public pricingTokens = [
  0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48, //USDC
  0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, //WETH
  0x6B175474E89094C44Da98b954EedeAC495271d0F, //DAI
  0xdAC17F958D2ee523a2206206994597C13D831ec7  //USDT
  ];
  address public definedOutputToken = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; //USDC

  //This is just for testing purposes.
  address[] public uniPools = [
  0x4d5ef58aAc27d99935E5b6B4A6778ff292059991,
  0xBb2b8038a1640196FbE3e38816F3e67Cba72D940,
  0x5233349957586A8207c52693A959483F9aeAA50C
  ];

  constructor(address _storage)
  Governable(_storage) public {}

  function getPrice(address token) external view returns (uint) {
    (bool uniSushiLP, bool curveLP, bool oneInchLP) = isLPCheck(token);
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
      uint256 usdValue = 0;
      uint256 i;
      for (i=0;i<2;i++) {
        priceToken = computePrice(tokens[i]);
        tokenValue = priceToken*amounts[i];
        usdValue = usdValue + tokenValue;
      }
      return usdValue;
    } else if (curveLP) {
      address[8] memory tokens;
      uint256[8] memory amounts;
      (tokens, amounts) = getCurveUnderlying(token);
      uint256 priceToken;
      uint256 tokenValue;
      uint256 usdValue = 0;
      uint256 i;
      for (i=0;i<tokens.length;i++) {
        priceToken = computePrice(tokens[i]);
        tokenValue = priceToken*amounts[i];
        usdValue = usdValue + tokenValue;
      }
      return usdValue;
    } else {
      uint256 usdValue = computePrice(token);
      return usdValue;
    }
  }

  function isLPCheck(address token) public view returns(bool, bool, bool) {
    bool isOneInch = isOneInchCheck(token);
    bool isUniSushi = isUniCheck(token) || isSushiCheck(token);
    bool isCurve = isCurveCheck(token);
    return (isUniSushi, isCurve, isOneInch);
  }

  function isOneInchCheck(address token) public view returns (bool) {
    bool oneInchLP = oneInchFactory.isPool(token);
    return oneInchLP;
  }

  function isUniCheck(address token) public view returns (bool) {
    /* uint256 nUniPools = uniswapFactory.allPairsLength(); */
    uint256 nUniPools = uniPools.length;
    uint256 i;
    address pool;
    for (i=0;i<nUniPools;i++) {
      /* pool = uniswapFactory.allPairs(i); */
      pool = uniPools[i];
      if (token == pool) {
        return true;
      }
    }
    return false;
  }

  function isSushiCheck(address token) public view returns (bool) {
    uint256 nSushiPools = sushiswapFactory.allPairsLength();
    uint256 i;
    address pool;
    for (i=0;i<nSushiPools;i++) {
      pool = sushiswapFactory.allPairs(i);
      if (token == pool) {
        return true;
      }
    }
    return false;
  }

  function isCurveCheck(address token) public view returns (bool) {
    uint256 nCurvePools = curveRegistry.pool_count();
    uint256 i;
    address pool;
    address lpToken;
    for (i=0;i<nCurvePools;i++) {
      pool = curveRegistry.pool_list(i);
      lpToken = curveRegistry.get_lp_token(pool);
      if (token == lpToken) {
        return true;
      }
    }
    return false;
  }

  function getUniUnderlying(address token) public view returns (address[2] memory, uint256[2] memory) {
    IUniswapV2Pair pair = IUniswapV2Pair(token);
    address[2] memory tokens;
    uint256[2] memory amounts;
    tokens[0] = pair.token0();
    tokens[1] = pair.token1();
    uint256 token0Decimals = ERC20Detailed(tokens[0]).decimals();
    uint256 token1Decimals = ERC20Detailed(tokens[1]).decimals();
    uint256 supplyDecimals = ERC20Detailed(token).decimals();
    (uint256 reserve0, uint256 reserve1, uint32 unused) = pair.getReserves();
    uint256 totalSupply = pair.totalSupply();
    amounts[0] = reserve0*10**(supplyDecimals-token0Decimals+precisionDecimals)/totalSupply;
    amounts[1] = reserve1*10**(supplyDecimals-token1Decimals+precisionDecimals)/totalSupply;
    return (tokens, amounts);
  }

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
      token0Decimals = ERC20Detailed(tokens[0]).decimals();
    }
    uint256 token1Decimals = ERC20Detailed(tokens[1]).decimals();
    uint256 supplyDecimals = ERC20Detailed(token).decimals();
    uint256 reserve0 = pair.getBalanceForRemoval(tokens[0]);
    uint256 reserve1 = pair.getBalanceForRemoval(tokens[1]);
    uint256 totalSupply = pair.totalSupply();
    amounts[0] = reserve0*10**(supplyDecimals-token0Decimals+precisionDecimals)/totalSupply;
    amounts[1] = reserve1*10**(supplyDecimals-token1Decimals+precisionDecimals)/totalSupply;

    //1INCH uses ETH, instead of WETH in pools. For further calculations we continue with WETH instead.
    //ETH will always be the first in the pair, so no need to check tokens[1]
    if (tokens[0] == address(0)) {
      tokens[0] = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    }
    return (tokens, amounts);
  }

  function getCurveUnderlying(address token) public view returns (address[8] memory, uint256[8] memory) {
    address pool = curveRegistry.get_pool_from_lp_token(token);
    address[8] memory tokens;
    uint256[8] memory reserves;
    if (token == 0xFd2a8fA60Abd58Efe3EeE34dd494cD491dC14900 || token == 0x02d341CcB60fAaf662bC0554d13778015d1b285C || token == 0x49849C98ae39Fff122806C06791Fa73784FB3675 || token == 0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3 || token == 0xaA17A236F2bAdc98DDc0Cf999AbB47D47Fc0A6Cf) {
      tokens = curveRegistry.get_coins(pool);
      reserves = curveRegistry.get_balances(pool);
    } else {
      tokens = curveRegistry.get_underlying_coins(pool);
      reserves = curveRegistry.get_underlying_balances(pool);
    }
    uint256[8] memory decimals;
    uint256 i;
    for (i=0;i<tokens.length;i++){
      if (tokens[i]==address(0)) {
        decimals[i]=0;
      } else if (tokens[i]==0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE){
        decimals[i] = 18;
        tokens[i] = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
      } else {
        decimals[i] = ERC20Detailed(tokens[i]).decimals();
      }
    }
    uint256 totalSupply = IERC20(token).totalSupply();
    uint256 supplyDecimals = ERC20Detailed(token).decimals();
    uint256[8] memory amounts;
    for (i=0;i<tokens.length;i++) {
      amounts[i] = reserves[i]*10**(supplyDecimals-decimals[i]+precisionDecimals)/totalSupply;
      while (amounts[i] > 10**precisionDecimals) {
        amounts[i] = amounts[i]/10;
      }
    }
    return (tokens, amounts);
  }

  function computePrice(address token) public view returns (uint256) {
    address keyToken = getLargestPool(token,keyTokens);
    uint256 priceVsKeyToken = getPriceVsToken(token,keyToken);
    uint256 keyTokenPrice = getKeyTokenPrice(keyToken);
    uint256 usdValue = priceVsKeyToken*keyTokenPrice;
    return usdValue;
  }

  function getLargestPool(address token, address[] memory tokenList) public view returns (address) {
    uint256 largestPoolSize = 0;
    address largestPoolAddress;
    uint256 poolSize;
    uint256 unused1;
    uint256 unused2;
    uint256 i;
    for (i=0;i<tokenList.length;i++) {
      address pairAddress = uniswapFactory.getPair(token,tokenList[i]);
      IUniswapV2Pair pair = IUniswapV2Pair(pairAddress);
      if (token == pair.token0()) {
        (poolSize, unused1, unused2) = pair.getReserves();
      } else {
        (unused1, poolSize, unused2) = pair.getReserves();
      }
      if (poolSize > largestPoolSize) {
        largestPoolSize = poolSize;
        largestPoolAddress = tokenList[i];
      }
    }
    return largestPoolAddress;
  }

  function getPriceVsToken(address token0, address token1) public view returns (uint256) {
    address pairAddress = uniswapFactory.getPair(token0,token1);
    IUniswapV2Pair pair = IUniswapV2Pair(pairAddress);
    (uint256 reserve0, uint256 reserve1, uint32 unused) = pair.getReserves();
    uint256 price;
    if (token0 == pair.token0()) {
      price = reserve0/reserve1;
    } else {
      price = reserve1/reserve0;
    }
    return price;
  }

  function getKeyTokenPrice(address token) public view returns (uint256) {
    bool isPricingToken = checkPricingToken(token);
    uint256 price;
    if (token == definedOutputToken) {
      price = 1;
    } else if (isPricingToken) {
      price = getPriceVsToken(token,definedOutputToken);
    } else {
      address pricingToken = getLargestPool(token,pricingTokens);
      uint256 priceVsPricingToken = getPriceVsToken(token,pricingToken);
      uint256 pricingTokenPrice = getPriceVsToken(pricingToken,definedOutputToken);
      price = priceVsPricingToken*pricingTokenPrice;
    }
    return price;
  }

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
