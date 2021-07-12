// SPDX-License-Identifier: MIT
import "@pancakeswap/pancake-swap-lib/contracts/token/BEP20/IBEP20.sol";
import "@pancakeswap/pancake-swap-lib/contracts/token/BEP20/SafeBEP20.sol";
//import "@pancakeswap/pancake-swap-lib/contracts/utils/Address.sol";
import "@pancakeswap/pancake-swap-lib/contracts/math/SafeMath.sol";
import "./interface/pancakeswap/IPancakeFactory.sol";
import "./interface/pancakeswap/IPancakePair.sol";
import "./interface/mooniswap/IMooniFactory.sol";
import "./interface/mooniswap/IMooniswap.sol";
import "./Governable.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";


pragma solidity 0.6.12;

contract OracleBSC_old is Governable {

    using EnumerableSet for EnumerableSet.AddressSet;
    EnumerableSet.AddressSet private stableTokens;
    using SafeBEP20 for IBEP20;
    using Address for address;
    using SafeMath for uint256;

    //Addresses for factories and registries for different DEX platforms. Functions will be added to allow to alter these when needed.
    address public pancakeFactoryAddress = 0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73;
    address public oneInchFactoryAddress = 0xD41B24bbA51fAc0E4827b6F94C0D6DDeB183cD64;
    uint256 public PRECISION_DECIMALS = 18;

    IPancakeFactory pancakeFactory = IPancakeFactory(pancakeFactoryAddress);
    IMooniFactory oneInchFactory = IMooniFactory(oneInchFactoryAddress);

    // registry for stable token -> sc address -> calldata to retrive price

    mapping(address => registry) tokenToPrice;

    struct registry {
        address _address;
        bytes _calldata;
    }

    mapping(address => address) replacementTokens;


    //Key tokens are used to find liquidity for any given token on Pancakeswap and 1INCH.
    address[] public keyTokens = [
    0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d, //USDC
    0x2170Ed0880ac9A755fd29B2688956BD959F933F8, //ETH
    0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3, //DAI
    0x55d398326f99059fF775485246999027B3197955, //USDT
    0x23396cF899Ca06c4472205fC903bDB4de249D6fC, //UST
    0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c, //BTCB
    0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56, //BUSD
    0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c, //WBNB
    0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7, //VAI
    0x111111111117dC0aa78b770fA6A738034120C302 //1INCH
    ];
    //Pricing tokens are Key tokens with good liquidity with the defined output token on Pancakeswap.
    address[] public pricingTokens = [
    0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c, //WBNB
    0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56, //BUSD
    0x23396cF899Ca06c4472205fC903bDB4de249D6fC, //UST
    0x55d398326f99059fF775485246999027B3197955, //USDT
    0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d, //USDC
    0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7, //VAI
    0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3  //DAI
    ];
    //The defined output token is the unit in which prices of input tokens are given.
    address public definedOutputToken = 0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56; //BUSD

    modifier validKeyToken(address keyToken){
        require(checkKeyToken(keyToken), "Not a Key Token");
        _;
    }
    modifier validPricingToken(address pricingToken){
        require(checkPricingToken(pricingToken), "Not a Pricing Token");
        _;
    }

    event FactoryChanged(address newFactory, address oldFactory);
    event KeyTokenAdded(address newKeyToken);
    event PricingTokenAdded(address newPricingToken);
    event KeyTokenRemoved(address keyToken);
    event PricingTokenRemoved(address pricingToken);
    event DefinedOutuptChanged(address newOutputToken, address oldOutputToken);

    constructor()
    Governable(msg.sender) public {}

    function changePancakeFactory(address newFactory) external onlyGovernance {
        address oldFactory = pancakeFactoryAddress;
        pancakeFactoryAddress = newFactory;
        pancakeFactory = IPancakeFactory(pancakeFactoryAddress);
        emit FactoryChanged(newFactory, oldFactory);
    }

    function changeOneInchFactory(address newFactory) external onlyGovernance {
        address oldFactory = oneInchFactoryAddress;
        oneInchFactoryAddress = newFactory;
        oneInchFactory = IMooniFactory(oneInchFactoryAddress);
        emit FactoryChanged(newFactory, oldFactory);
    }

    function addKeyToken(address newToken) external onlyGovernance {
        require((checkKeyToken(newToken) == false), "Already a key token");
        keyTokens.push(newToken);
        emit KeyTokenAdded(newToken);
    }

    function addPricingToken(address newToken) public onlyGovernance validKeyToken(newToken) {
        require((checkPricingToken(newToken) == false), "Already a pricing token");
        pricingTokens.push(newToken);
        emit PricingTokenAdded(newToken);
    }

    function removeKeyToken(address keyToken) external onlyGovernance validKeyToken(keyToken) {
        uint256 i;
        for (i = 0; i < keyTokens.length; i++) {
            if (keyToken == keyTokens[i]) {
                break;
            }
        }
        while (i < keyTokens.length - 1) {
            keyTokens[i] = keyTokens[i + 1];
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
        for (i = 0; i < pricingTokens.length; i++) {
            if (pricingToken == pricingTokens[i]) {
                break;
            }
        }
        while (i < pricingTokens.length - 1) {
            pricingTokens[i] = pricingTokens[i + 1];
            i++;
        }
        pricingTokens.pop();
        emit PricingTokenRemoved(pricingToken);
    }

    function changeDefinedOutput(address newOutputToken) external onlyGovernance validKeyToken(newOutputToken) {
        address oldOutputToken = definedOutputToken;
        definedOutputToken = newOutputToken;
        emit DefinedOutuptChanged(newOutputToken, oldOutputToken);
    }

    function modifyReplacementTokens(address _inputToken, address _replacementToken)
    external onlyGovernance
    {
        replacementTokens[_inputToken] = _replacementToken;
    }


    //Main function of the contract. Gives the price of a given token in the defined output token.
    //The contract allows for input tokens to be LP tokens from Pancakeswap and 1Inch.
    //In case of LP token, the underlying tokens will be found and valued to get the price.
    function getPrice(address token) external view returns (uint256) {
        if (token == definedOutputToken) {
            return (10 ** PRECISION_DECIMALS);
        }

        // if the token exists in the mapping, we'll swapp it for the replacement
        // example btcb/renbtc pool -> btcb
        if (replacementTokens[token] != address(0)) {
            token = replacementTokens[token];
        }

        // jump out if it's a stable
        if (isStableToken(token)) {
            return getStablesPrice(token);
        }

        bool pancakeLP;
        bool oneInchLP;
        (pancakeLP, oneInchLP) = isLPCheck(token);
        uint256 priceToken;
        uint256 tokenValue;
        uint256 price;
        uint256 i;
        if (pancakeLP || oneInchLP) {
            address[2] memory tokens;
            uint256[2] memory amounts;
            (tokens, amounts) = (pancakeLP) ? getPancakeUnderlying(token) : getOneInchUnderlying(token);
            for (i = 0; i < 2; i++) {
                priceToken = computePrice(tokens[i]);
                if (priceToken == 0) {
                    price = 0;
                    return price;
                }
                tokenValue = priceToken * amounts[i] / 10 ** PRECISION_DECIMALS;
                price = price + tokenValue;
            }
            return price;
        } else {
            return computePrice(token);
        }
    }

    function isLPCheck(address token) public view returns (bool, bool) {
        bool isOneInch = isOneInchCheck(token);
        bool isPancake = isPancakeCheck(token);
        return (isPancake, isOneInch);
    }

    //Checks if address is 1Inch LP
    function isOneInchCheck(address token) internal view returns (bool) {
        bool oneInchLP = oneInchFactory.isPool(token);
        return oneInchLP;
    }

    //Checks if address is Pancake LP. This is done in two steps, because the second step seems to cause errors for some tokens.
    //Only the first step is not deemed accurate enough, as any token could be called Cake-LP.
    function isPancakeCheck(address token) internal view returns (bool) {
        IPancakePair pair = IPancakePair(token);
        IBEP20 pairToken = IBEP20(token);
        string memory pancakeSymbol = "Cake-LP";
        string memory symbol = pairToken.symbol();
        if (isEqualString(symbol, pancakeSymbol)) {
            return checkFactory(pair, pancakeFactoryAddress);
        } else {
            return false;
        }
    }

    function isEqualString(string memory arg1, string memory arg2) internal pure returns (bool) {
        bool check = (keccak256(abi.encodePacked(arg1)) == keccak256(abi.encodePacked(arg2))) ? true : false;
        return check;
    }

    function checkFactory(IPancakePair pair, address compareFactory) internal view returns (bool) {
        try pair.factory{gas : 3000}() returns (address factory) {
            bool check = (factory == compareFactory) ? true : false;
            return check;
        } catch {
            return false;
        }
    }

    //Get underlying tokens and amounts for Pancake LPs
    function getPancakeUnderlying(address token) public view returns (address[2] memory, uint256[2] memory) {
        IPancakePair pair = IPancakePair(token);
        IBEP20 pairToken = IBEP20(token);
        address[2] memory tokens;
        uint256[2] memory amounts;
        tokens[0] = pair.token0();
        tokens[1] = pair.token1();
        uint256 token0Decimals = IBEP20(tokens[0]).decimals();
        uint256 token1Decimals = IBEP20(tokens[1]).decimals();
        uint256 supplyDecimals = IBEP20(token).decimals();
        (uint256 reserve0, uint256 reserve1,) = pair.getReserves();
        uint256 totalSupply = pairToken.totalSupply();
        if (reserve0 == 0 || reserve1 == 0 || totalSupply == 0) {
            amounts[0] = 0;
            amounts[1] = 0;
            return (tokens, amounts);
        }
        amounts[0] = reserve0 * 10 ** (supplyDecimals - token0Decimals + PRECISION_DECIMALS) / totalSupply;
        amounts[1] = reserve1 * 10 ** (supplyDecimals - token1Decimals + PRECISION_DECIMALS) / totalSupply;
        return (tokens, amounts);
    }

    //Get underlying tokens and amounts for 1Inch LPs
    function getOneInchUnderlying(address token) public view returns (address[2] memory, uint256[2] memory) {
        IMooniswap pair = IMooniswap(token);
        address[2] memory tokens;
        uint256[2] memory amounts;
        tokens[0] = pair.token0();
        tokens[1] = pair.token1();
        uint256 token0Decimals = (tokens[0] == address(0)) ? 18 : IBEP20(tokens[0]).decimals();
        uint256 token1Decimals = IBEP20(tokens[1]).decimals();
        uint256 supplyDecimals = IBEP20(token).decimals();
        uint256 reserve0 = pair.getBalanceForRemoval(tokens[0]);
        uint256 reserve1 = pair.getBalanceForRemoval(tokens[1]);
        uint256 totalSupply = pair.totalSupply();
        if (reserve0 == 0 || reserve1 == 0 || totalSupply == 0) {
            amounts[0] = 0;
            amounts[1] = 0;
            return (tokens, amounts);
        }
        amounts[0] = reserve0 * 10 ** (supplyDecimals - token0Decimals + PRECISION_DECIMALS) / totalSupply;
        amounts[1] = reserve1 * 10 ** (supplyDecimals - token1Decimals + PRECISION_DECIMALS) / totalSupply;

        //1INCH uses BNB, instead of WBNB in pools. For further calculations we continue with WBNB instead.
        //BNB will always be the first in the pair, so no need to check tokens[1]
        if (tokens[0] == address(0)) {
            tokens[0] = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;
        }
        return (tokens, amounts);
    }

    //General function to compute the price of a token vs the defined output token.
    function computePrice(address token) public view returns (uint256) {
        uint256 price;
        if (token == definedOutputToken) {
            price = 10 ** PRECISION_DECIMALS;
        } else if (token == address(0)) {
            price = 0;
        } else {
            (address keyToken, bool pancake) = getLargestPool(token, keyTokens);
            uint256 priceVsKeyToken;
            uint256 keyTokenPrice;
            if (keyToken == address(0)) {
                price = 0;
            } else if (pancake) {
                priceVsKeyToken = getPriceVsTokenPancake(token, keyToken);
                keyTokenPrice = getKeyTokenPrice(keyToken);
                price = priceVsKeyToken * keyTokenPrice / 10 ** PRECISION_DECIMALS;
            } else {
                priceVsKeyToken = getPriceVsToken1Inch(token, keyToken);
                keyTokenPrice = getKeyTokenPrice(keyToken);
                price = priceVsKeyToken * keyTokenPrice / 10 ** PRECISION_DECIMALS;
            }
        }
        return (price);
    }

    //Checks the results of the different largest pool functions and returns the largest.
    function getLargestPool(address token, address[] memory tokenList) public view returns (address, bool) {
        (address pancakeKeyToken, uint256 pancakeLiquidity) = getPancakeLargestPool(token, tokenList);
        (address oneInchKeyToken, uint256 oneInchLiquidity) = get1InchLargestPool(token, tokenList);
        if (pancakeLiquidity > oneInchLiquidity) {
            return (pancakeKeyToken, true);
        } else {
            return (oneInchKeyToken, false);
        }
    }

    //Gives the Pancakeswap pool with largest liquidity for a given token and a given tokenset (either keyTokens or pricingTokens)
    function getPancakeLargestPool(address token, address[] memory tokenList) internal view returns (address, uint256) {
        uint256 largestPoolSize = 0;
        address largestKeyToken;
        uint256 poolSize;
        uint256 i;
        for (i = 0; i < tokenList.length; i++) {
            address pairAddress = pancakeFactory.getPair(token, tokenList[i]);
            if (pairAddress != address(0)) {
                poolSize = getPancakePoolSize(pairAddress, token);
            } else {
                poolSize = 0;
            }
            if (poolSize > largestPoolSize) {
                largestPoolSize = poolSize;
                largestKeyToken = tokenList[i];
            }
        }
        return (largestKeyToken, largestPoolSize);
    }

    function getPancakePoolSize(address pairAddress, address token) internal view returns (uint256) {
        IPancakePair pair = IPancakePair(pairAddress);
        address token0 = pair.token0();
        (uint112 poolSize0, uint112 poolSize1,) = pair.getReserves();
        uint256 poolSize = (token == token0) ? poolSize0 : poolSize1;
        return poolSize;
    }

    //Gives the 1INCH pool with largest liquidity for a given token and a given tokenset (either keyTokens or pricingTokens)
    function get1InchLargestPool(address token, address[] memory tokenList) internal view returns (address, uint256) {
        uint256 largestPoolSize = 0;
        address largestKeyToken;
        uint256 poolSize;
        uint256 i;
        for (i = 0; i < tokenList.length; i++) {
            address pairAddress = oneInchFactory.pools(token, tokenList[i]);
            if (pairAddress != address(0)) {
                poolSize = get1InchPoolSize(pairAddress, token);
            } else {
                poolSize = 0;
            }
            if (poolSize > largestPoolSize) {
                largestPoolSize = poolSize;
                largestKeyToken = tokenList[i];
            }
        }
        return (largestKeyToken, largestPoolSize);
    }

    function get1InchPoolSize(address pairAddress, address token) internal view returns (uint256) {
        IMooniswap pair = IMooniswap(pairAddress);
        address token0 = pair.token0();
        address token1 = pair.token1();
        uint256 poolSize0;
        uint256 poolSize1;

        try pair.getBalanceForRemoval(token0) returns (uint256 poolSize) {
            poolSize0 = poolSize;
        } catch {
            poolSize0 = 0;
        }

        try pair.getBalanceForRemoval(token1) returns (uint256 poolSize) {
            poolSize1 = poolSize;
        } catch {
            poolSize1 = 0;
        }

        if (token0 == address(0)) {
            token0 = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;
        }
        uint256 poolSize = (token == token0) ? poolSize0 : poolSize1;
        return poolSize;
    }

    //Generic function giving the price of a given token vs another given token on Pancakeswap.
    function getPriceVsTokenPancake(address token0, address token1) internal view returns (uint256) {
        address pairAddress = pancakeFactory.getPair(token0, token1);
        IPancakePair pair = IPancakePair(pairAddress);
        (uint256 reserve0, uint256 reserve1,) = pair.getReserves();
        uint256 token0Decimals = IBEP20(token0).decimals();
        uint256 token1Decimals = IBEP20(token1).decimals();
        uint256 price;
        if (token0 == pair.token0()) {
            price = (reserve1 * 10 ** (token0Decimals - token1Decimals + PRECISION_DECIMALS)) / reserve0;
        } else {
            price = (reserve0 * 10 ** (token0Decimals - token1Decimals + PRECISION_DECIMALS)) / reserve1;
        }
        return price;
    }

    //Generic function giving the price of a given token vs another given token on 1INCH.
    function getPriceVsToken1Inch(address token0, address token1) internal view returns (uint256) {
        address pairAddress = oneInchFactory.pools(token0, token1);
        IMooniswap pair = IMooniswap(pairAddress);
        uint256 reserve0 = pair.getBalanceForRemoval(token0);
        uint256 reserve1 = pair.getBalanceForRemoval(token1);
        uint256 token0Decimals = IBEP20(token0).decimals();
        uint256 token1Decimals = IBEP20(token1).decimals();
        uint256 price = (reserve1 * 10 ** (token0Decimals - token1Decimals + PRECISION_DECIMALS)) / reserve0;
        return price;
    }

    //Gives the price of a given keyToken.
    function getKeyTokenPrice(address token) internal view returns (uint256) {
        bool isPricingToken = checkPricingToken(token);
        uint256 price;
        uint256 priceVsPricingToken;
        if (token == definedOutputToken) {
            price = 10 ** PRECISION_DECIMALS;
        } else if (isPricingToken) {
            price = getPriceVsTokenPancake(token, definedOutputToken);
        } else {
            uint256 pricingTokenPrice;
            (address pricingToken, bool pancake) = getLargestPool(token, pricingTokens);
            if (pancake) {
                priceVsPricingToken = getPriceVsTokenPancake(token, pricingToken);
            } else {
                priceVsPricingToken = getPriceVsToken1Inch(token, pricingToken);
            }
            pricingTokenPrice = (pricingToken == definedOutputToken) ? 10 ** PRECISION_DECIMALS : getPriceVsTokenPancake(pricingToken, definedOutputToken);
            price = priceVsPricingToken * pricingTokenPrice / 10 ** PRECISION_DECIMALS;
        }
        return price;
    }

    //Checks if a given token is in the pricingTokens list.
    function checkPricingToken(address token) public view returns (bool) {
        uint256 i;
        for (i = 0; i < pricingTokens.length; i++) {
            if (token == pricingTokens[i]) {
                return true;
            }
        }
        return false;
    }

    //Checks if a given token is in the keyTokens list.
    function checkKeyToken(address token) public view returns (bool) {
        uint256 i;
        for (i = 0; i < keyTokens.length; i++) {
            if (token == keyTokens[i]) {
                return true;
            }
        }
        return false;
    }

    // @param _token token to be queried
    // @param _address sc address in registry
    // @param _calldata abi encoded function signature with parameters to be called
    function modifyRegistry(address _token, address _address, bytes calldata _calldata)
    external onlyGovernance
    returns (bool)
    {
        registry memory r;
        r._address = _address;
        r._calldata = _calldata;
        tokenToPrice[_token] = r;
        return true;
    }

    //@param _token token to be added to stable token set
    function addStableToken(address _token)
    external onlyGovernance
    returns (bool)
    {
        stableTokens.add(_token);
        return true;
    }

    //@param _token token to be removed from stable token set
    function removeStableToken(address _token)
    external onlyGovernance
    returns (bool)
    {
        stableTokens.remove(_token);
        return true;
    }

    //@param _token to check if is stable token
    function isStableToken(address _token)
    internal view
    returns (bool)
    {
        return stableTokens.contains(_token);
    }

    //@dev queries the struct registry that has previously been loaded with smart contract address,
    // calldata that retrieves the price for that particular token, this can be changed via modifyRegistry
    //@param _token token to return price for
    function getStablesPrice(address _token)
    internal view
    returns (uint256)
    {
        registry memory r = tokenToPrice[_token];
        (bool success, bytes memory returnData) = r._address.staticcall(r._calldata);
        require(success, "couldn't call for price data"); // this is very unlikely to not succeed
        return abi.decode(returnData, (uint256));

    }


}
