// This test is only invoked if MAINNET_FORK is set
if ( process.env.MAINNET_FORK ) {

  const Utils = require("./Utils.js");
  const MFC = require("./mainnet-fork-test-config.js");
  const { expectRevert, send, time } = require('@openzeppelin/test-helpers');
  const BigNumber = require('bignumber.js');
  const Storage = artifacts.require("Storage");
  const Oracle = artifacts.require("Oracle");

  // ERC20 interface
  const IERC20 = artifacts.require("IERC20");
  const ERC20Detailed = artifacts.require("ERC20Detailed")
  const IUniswapV2Factory = artifacts.require("IUniswapV2Factory");
  const IRegistry = artifacts.require("IRegistry");

  contract("Oracle unit test", function(accounts){
    describe("Testing all functionality", function (){

      function sum(total,num) {
        return BigNumber.sum(total,num);
      }
      // parties in the protocol
      let governance = accounts[1];

      // Core protocol contracts
      let storage;
      let oracle;

      let uniswapFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
      let sushiswapFactoryAddress = "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac";
      let curveRegistryAddress = "0x7D86446dDb609eD0F5f8684AcF30380a356b2B4c";

      let normalTokens = [MFC.FARM_ADDRESS, MFC.UNI_ADDRESS, MFC.renBTC_ADDRESS, MFC.BAC_ADDRESS, MFC.MAAPL_ADDRESS, MFC.USDC_ADDRESS, MFC.UST_ADDRESS];
      let uniLPs = [MFC.UNISWAP_ETH_DPI_LP_ADDRESS, MFC.UNISWAP_ETH_WBTC_LP_ADDRESS, MFC.UNISWAP_MTSLA_UST_LP_ADDRESS];
      let sushiLPs = [MFC.SUSHISWAP_WBTC_TBTC_LP_ADDRESS, MFC.SUSHISWAP_UST_WETH_LP_ADDRESS, MFC.SUSHISWAP_MIS_USDT_LP_ADDRESS];
      let curveLPs = [];
      let oneInchLPs = [MFC.ONEINCH_ETH_USDC_LP_ADDRESS, MFC.ONEINCH_ONEINCH_ETH_LP_ADDRESS, MFC.ONEINCH_ETH_FET_LP_ADDRESS];

      beforeEach(async function () {
        console.log("Setting up contract")
        // deploy storage
        storage = await Storage.new({ from: governance });
        //deploy Viewer
        oracle = await Oracle.new(storage.address, {from: governance});

        uniswapFactory = await IUniswapV2Factory.at(uniswapFactoryAddress);
        sushiswapFactory = await IUniswapV2Factory.at(sushiswapFactoryAddress);
        curveRegistry = await IRegistry.at(curveRegistryAddress);

        console.log("Initialize checkLP functions");

        nSushiPools = await sushiswapFactory.allPairsLength();
        console.log(nSushiPools);
        for (i=0;i<nSushiPools;i++) {
          pool = await sushiswapFactory.allPairs(i);
        }
        console.log("Sushi done");
        // // nUniPools = await uniswapFactory.allPairsLength();
        // // console.log(nUniPools);
        // // for (i=0;i<nUniPools;i++) {
        // //   pool = await uniswapFactory.allPairs(i);
        // // }
        // // console.log("Uni done");
        nCurvePools = await curveRegistry.pool_count();
        console.log(nCurvePools);
        for (i=0;i<nCurvePools;i++) {
          pool = await curveRegistry.pool_list(i);
          lpToken = await curveRegistry.get_lp_token(pool);
          curveLPs.push(lpToken);
        }
        console.log("Curve done");
        console.log("");
      });

      it("Test", async function () {
        for (i=0;i<normalTokens.length;i++) {
          console.log("token",i);
          isPricingToken = await oracle.checkPricingToken(normalTokens[i]);
          console.log("isPricing:",isPricingToken);
          console.log("");

          isLP = await oracle.isLPCheck(normalTokens[i]);
          console.log("isLP:", isLP);
          console.log("");
        }
        for (i=0;i<uniLPs.length;i++) {
          console.log("token",i);
          isPricingToken = await oracle.checkPricingToken(uniLPs[i]);
          console.log("isPricing:",isPricingToken);
          console.log("");

          isLP = await oracle.isLPCheck(uniLPs[i]);
          console.log("isLP:", isLP);
          console.log("");

          underlying = await oracle.getUniUnderlying(uniLPs[i]);
          console.log("underlying:", underlying[0]);
          console.log("Amounts:", BigNumber(underlying[1][0]).toFixed()/1e6,BigNumber(underlying[1][1]).toFixed()/1e6);
          console.log("")

        }
        for (i=0;i<sushiLPs.length;i++) {
          console.log("token",i);
          isPricingToken = await oracle.checkPricingToken(sushiLPs[i]);
          console.log("isPricing:",isPricingToken);
          console.log("");

          isLP = await oracle.isLPCheck(sushiLPs[i]);
          console.log("isLP:", isLP);
          console.log("");

          underlying = await oracle.getUniUnderlying(sushiLPs[i]);
          console.log("underlying:", underlying[0]);
          console.log("Amounts:", BigNumber(underlying[1][0]).toFixed()/1e6,BigNumber(underlying[1][1]).toFixed()/1e6);
          console.log("")

        }
        for (i=0;i<curveLPs.length;i++) {
          console.log("token",i, curveLPs[i]);
          // isPricingToken = await oracle.checkPricingToken(curveLPs[i]);
          // console.log("isPricing:",isPricingToken);
          // console.log("");
          //
          // isLP = await oracle.isLPCheck(curveLPs[i]);
          // console.log("isLP:", isLP);
          // console.log("");

          underlying = await oracle.getCurveUnderlying(curveLPs[i]);
          console.log("underlying:", underlying[0]);
          console.log("Amounts:", BigNumber(underlying[1][0]).toFixed()/1e6,BigNumber(underlying[1][1]).toFixed()/1e6,BigNumber(underlying[1][2]).toFixed()/1e6,BigNumber(underlying[1][3]).toFixed()/1e6);
          console.log("Sum Amounts:", BigNumber(underlying[1].reduce(sum)).toFixed()/1e6)
          console.log("")
        }
        for (i=0;i<oneInchLPs.length;i++) {
          console.log("token",i);
          isPricingToken = await oracle.checkPricingToken(oneInchLPs[i]);
          console.log("isPricing:",isPricingToken);
          console.log("");

          isLP = await oracle.isLPCheck(oneInchLPs[i]);
          console.log("isLP:", isLP);
          console.log("");

          underlying = await oracle.getOneInchUnderlying(oneInchLPs[i]);
          console.log("underlying:", underlying[0]);
          console.log("Amounts:", BigNumber(underlying[1][0]).toFixed()/1e6,BigNumber(underlying[1][1]).toFixed()/1e6);
          console.log("")

        }

      });
    });
  });
}
