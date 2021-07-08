// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/utils/Address.sol";
import "./Governable.sol";
import "./OracleBase.sol";
import "./SwapBase.sol";
import "./PancakeSwap.sol";
import "./OneInchSwap.sol";

pragma solidity 0.6.12;

contract OracleBSC is OracleBase {

    using Address for address;

    constructor(address _storage) OracleBase(_storage) public {
        address USDC = 0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d;
        address ETH  = 0x2170Ed0880ac9A755fd29B2688956BD959F933F8;
        address DAI  = 0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3;
        address USDT = 0x55d398326f99059fF775485246999027B3197955;
        address UST  = 0x23396cF899Ca06c4472205fC903bDB4de249D6fC;
        address BTCB = 0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c;
        address BUSD = 0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56;
        address WBNB = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;
        address VAI  = 0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7;
        address ONEINCH = 0x111111111117dC0aa78b770fA6A738034120C302;

        //Key tokens are used to find liquidity for any given token on Uni, Sushi and Curve.
        keyTokens = [ USDC, ETH, DAI, USDT, UST, BTCB, BUSD, WBNB, VAI, ONEINCH ];

        //Pricing tokens are Key tokens with good liquidity with the defined output token on Uniswap.
        pricingTokens = [ WBNB, BUSD, UST, USDT, USDC, VAI, DAI ];

        //The defined output token is the unit in which prices of input tokens are given.
        definedOutputToken = BUSD;

        PancakeSwap pancakeFactory = new PancakeSwap( 0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73, _storage);
        OneInchSwap oneInchFactory = new OneInchSwap( 0xD41B24bbA51fAc0E4827b6F94C0D6DDeB183cD64, _storage, WBNB);

        swaps = [
            address(pancakeFactory), // Primary swap, used in getKeyTokenPrice
            address(oneInchFactory)
        ];
    }

 /*   function initialize(address _storage) public virtual override initializer {
        super.initialize(_storage);
    }
*/
}
