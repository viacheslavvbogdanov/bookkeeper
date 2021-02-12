import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./uniswap/interfaces/IUniswapV2Factory.sol";
import "./uniswap/interfaces/IUniswapV2Pair.sol";
import "./curve/interfaces/IRegistry.sol";
import "./mooniswap/interfaces/IMooniswap.sol";
import "./Storage.sol";
import "./Governable.sol";

pragma solidity 0.5.16;

contract Oracle is Governable {

  using SafeERC20 for IERC20;
  using Address for address;
  using SafeMath for uint256;

  address public uniswapFactory = 0x7D86446dDb609eD0F5f8684AcF30380a356b2B4c;
  address public sushiswapFactory = 0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac;
  address public curveRegistry = 0x7D86446dDb609eD0F5f8684AcF30380a356b2B4c;

  IUniswapV2Factory uniswapFactory = IUniswapV2Factory(uniswapFactory);
  IUniswapV2Factory sushiswapFactory = IUniswapV2Factory(sushiswapFactory);
  IRegistry curveRegistry = IRegistry(curveRegistry);

  address[] public keyTokens;
  address[] public pricingToken;
  address public definedUSD;

  constructor(address _storage)
  Governable(_storage) public {}

  function getPrice(address token, bool uniSushiLP, bool sushiLP, bool cuveLP, bool 1inchLP) external view returns (uint) {
    if (uniSushiLP || 1inchLP) {
      if (uniSushiLP) {
        address[2] tokens, uint256[2] amounts = getUniUnderlying(token);
      } else {
        address[2] tokens, uint256[2] amounts = get1inchUnderlying(token);
      }
      uint[2] priceToken;
      uint[2] tokenValues;
      for (i=0,i<2,i++) {
        priceToken = computePrice(tokens[i]);
        tokenValue = priceToken*amounts[i];
        usdValue =+ tokenValue;
      }
      return usdValue;
    } else if (curveLP) {
      address[] tokens, uint256[] amounts = getCurveUnderlying(token);
      uint[] priceToken;
      uint[] tokenValues;
      uint256 usdValue = 0;
      for (i=0,i<tokens.length,i++) {
        priceToken = computePrice(tokens[i]);
        tokenValue = priceToken*amounts[i];
        usdValue =+ tokenValue;
      }
      return usdValue;
    } else {
      usdValue = computePrice(token);
    }

    function getUniUnderlying(address token) public view returns (address[2], uint256[2]) {
      IUniswapV2Pair pair = IUniswapV2Pair(token);
      address[2] tokens;
      uint256[2] amounts;
      tokens[0] = pair.token0();
      tokens[1] = pair.token1();
      uint256[3] reserves = pair.getReserves();
      uint256 totalSupply = pair.totalSupply();
      amounts[0] = balances[0]/totalSupply;
      amounts[1] = balances[0]/totalSupply;
      return (tokens, amounts);
    }

    function get1inchUnderlying(address token) public view returns (address[2], uint256[2]) {
      IMooniswap pair = IMooniswap(token);
      address[2] tokens;
      uint256[2] reserves;
      uint256[2] amounts;
      tokens[0] = pair.token0();
      tokens[1] = pair.token1();
      reserves[0] = pair.getBalanceForRemoval(tokens[0]);
      reserves[1] = pair.getBalanceForRemoval(tokens[0]);
      uint256 totalSupply = pair.totalSupply();
      amounts[0] = balances[0]/totalSupply;
      amounts[1] = balances[0]/totalSupply;

      //1INCH uses ETH, instead of WETH in pools. For further calculations we continue with WETH instead.
      //ETH will always be the first in the pair, so no need to check tokens[1]
      if (tokens[0] = address(0)) {
        tokens[0] = 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2;
      }
      return (tokens, amounts);
    }

    function getCurveUnderlying(address token) public view returns (address[], uint256[]) {
      pool = curveRegistry.get_pool_from_lp_token(token);
      address[] tokens = curveRegistry.get_underlying_coins(pool);
      uint256[] reserves = curveRegistry.get_underlying_balances(pool);
      uint256 totalSupply = IERC20(token).totalSupply();
      uint256[] amounts;
      for (i=0;i<tokens.length;i++) {
        amounts[i] = reserves[i]/totalSupply;
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

    function getLargestPool(address token, address tokenList) public view returns (address) {
      uint256 largestPoolSize = 0;
      address largestPoolAddress;
      uint256 poolSize;
      for (i=0,i<tokenList.length,i++) {
        address pairAddress = uniswapFactory.getPair(token,tokenList[i]);
        IUniswapV2Pair pair = IUniswapV2Pair(pairAddress);
        if (token == pair.token0()) {
          poolSize = pair.getReserves()[0];
        } else {
          poolSize = pair.getReserves()[1];
        }
        if (poolSize > largestPoolSize) {
          largestPoolSize = poolSize;
          largestPoolAddress = tokenList[i];
        }
      }
      return (largestPoolAddress)
    }

    function getPriceVsToken(address token0, address token1) public view returns (uint256) {
      address pairAddress = uniswapFactory.getPair(token0,token1);
      IUniswapV2Pair pair = IUniswapV2Pair(pairAddress);
      uint256[3] reserves = pair.getReserves();
      uint256 price;
      if (token0 == pair.token0()) {
        price = reserves[0]/reserves[1];
      } else {
        price = reserves[1]/reserves[0];
      }
      return price;
    }

    function getKeyTokenPrice(address token) public view returns (uint256) {
      isPricingToken = checkPricingToken(token);
      uint256 price;
      if (token == definedUSD) {
        price = 1;
      } else if (isPricingToken) {
        price = getPriceVsToken(token,definedUSD);
      } else {
        address pricingToken = getLargestPool(token,pricingTokens);
        uint256 priceVsPricingToken = getPriceVsToken(token,pricingToken);
        uint256 pricingTokenPrice = getPriceVsToken(pricingToken,definedUSD);
        price = priceVsPricingToken*pricingTokenPrice;
      }
      return price;
    }
}
