// This test is only invoked if MAINNET_FORK is set
if ( process.env.MAINNET_FORK ) {

  const Utils = require("./Utils.js");
  const MFC = require("./mainnet-fork-test-config.js");
  const CoinGecko = require("coingecko-api");
  const CoinGeckoClient = new CoinGecko();
  const { expectRevert, send, time } = require('@openzeppelin/test-helpers');
  const BigNumber = require('bignumber.js');
  const Storage = artifacts.require("Storage");
  const Oracle = artifacts.require("Oracle");

  // ERC20 interface
  const IERC20 = artifacts.require("IERC20");
  const ERC20 = artifacts.require("ERC20")
  const IUniswapV2Factory = artifacts.require("IUniswapV2Factory");
  const IUniswapV2Pair = artifacts.require("IUniswapV2Pair");
  const ICurveRegistry = artifacts.require("ICurveRegistry");
  const ICurvePool = artifacts.require("ICurvePool")
  const IMooniFactory = artifacts.require("IMooniFactory")

  contract("Oracle unit test", function(accounts){
    describe("Testing all functionality", function (){

      function sum(total,num) {
        return BigNumber.sum(total,num);
      }

      let precisionDecimals = 18;
      // parties in the protocol
      let governance = accounts[1];

      // Core protocol contracts
      let storage;
      let oracle;

      let uniswapFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
      let sushiswapFactoryAddress = "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac";
      let curveRegistryAddress = "0x7D86446dDb609eD0F5f8684AcF30380a356b2B4c";
      let oneInchFactoryAddress = "0xbAF9A5d4b0052359326A6CDAb54BABAa3a3A9643";

      let normalTokens = [];
      let uniLPs = [];
      let sushiLPs = [];
      let curveLPs = [];
      let oneInchLPs = [MFC.ONEINCH_ETH_USDC_LP_ADDRESS, MFC.ONEINCH_ONEINCH_ETH_LP_ADDRESS, MFC.ONEINCH_ETH_FET_LP_ADDRESS];

      let keyTokens = [
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", //USDC
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", //WETH
      "0x6B175474E89094C44Da98b954EedeAC495271d0F", //DAI
      "0xdAC17F958D2ee523a2206206994597C13D831ec7", //USDT
      "0xa47c8bf37f92aBed4A126BDA807A7b7498661acD", //UST
      "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", //WBTC
      "0xdB25f211AB05b1c97D595516F45794528a807ad8"  //EURS
      ];
      let pricingTokens = [
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", //USDC
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", //WETH
      "0x6B175474E89094C44Da98b954EedeAC495271d0F", //DAI
      "0xdAC17F958D2ee523a2206206994597C13D831ec7", //USDT
      "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", //WBTC
      "0xdB25f211AB05b1c97D595516F45794528a807ad8"  //EURS
      ];
      let definedOutputToken = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; //USDC

      beforeEach(async function () {
        console.log("Setting up contract")
        // deploy storage
        storage = await Storage.new({ from: governance });
        //deploy Oracle
        oracle = await Oracle.new(storage.address, {from: governance});

        uniswapFactory = await IUniswapV2Factory.at(uniswapFactoryAddress);
        sushiswapFactory = await IUniswapV2Factory.at(sushiswapFactoryAddress);
        curveRegistry = await ICurveRegistry.at(curveRegistryAddress);
        oneInchFactory = await IMooniFactory.at(oneInchFactoryAddress);


        // nSushiPools = await sushiswapFactory.allPairsLength();
        // console.log("Sushi pools:", BigNumber(nSushiPools).toFixed());
        // for (i=0;i<nSushiPools;i++) {
        //   pool = await sushiswapFactory.allPairs(i);
        //   sushiLPs.push(pool);
        // }
        // console.log("Sushi done");

        nUniPools = await uniswapFactory.allPairsLength();
        nUniPools = 500;
        console.log("Uni pools:", BigNumber(nUniPools).toFixed());
        for (i=20000;i<(20000+nUniPools);i++) {
          pool = await uniswapFactory.allPairs(i);
          uniLPs.push(pool);
        }
        console.log("Uni done");

        // nCurvePools = await curveRegistry.pool_count();
        // console.log("Curve pools:", BigNumber(nCurvePools).toFixed());
        // for (i=0;i<nCurvePools;i++) {
        //   pool = await curveRegistry.pool_list(i);
        //   lpToken = await curveRegistry.get_lp_token(pool);
        //   curveLPs.push(lpToken);
        // }
        // console.log("Curve done");
        // console.log("");
        //
        // oneInchLPs = await oneInchFactory.getAllPools();
        // nOneInchPools = oneInchLPs.length;
        // console.log("1Inch pools:", nOneInchPools);

        for (i=0;i<nUniPools;i++) {
          pair = await IUniswapV2Pair.at(uniLPs[i]);
          token0 = await pair.token0();
          token1 = await pair.token1();
          check0 = 0;
          check1 = 0;
          for (j=0;j<normalTokens.length;j++) {
            if (token0 == normalTokens[j]) {
              check0 = 1;
            }
            if (token1 == normalTokens[j]) {
              check1 = 1;
            }
          }
          if (check0 == 0) {
            normalTokens.push(token0);
          }
          if (check1 == 0) {
            normalTokens.push(token1);
          }
        }
        console.log("Normal tokens:", normalTokens.length)

      });

      it("Test", async function () {
        checkTokens = [
          '0x4997310AC1E1537A452b0ECBACb1989d3a579AC1',
          '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2'
        ];

        for (i=0;i<checkTokens.length;i++) {
          console.log("Token",i,checkTokens[i]);
          try {
            console.time("getPrice");
            price2 = await oracle.getPrice(checkTokens[i]);
            console.timeEnd("getPrice");
            console.log("price:", BigNumber(price2).toFixed()/10**precisionDecimals);
          } catch (error) {
            console.log("Token", i, checkTokens[i]);
            console.error(error);
          }
        }

        for (i=0;i<normalTokens.length;i++) {
          // console.log("Token",i,normalTokens[i]);
          try {
            // console.time("getPrice");
            price2 = await oracle.getPrice(normalTokens[i]);
            // console.timeEnd("getPrice");
            // console.log("price:", BigNumber(price2).toFixed()/10**precisionDecimals);
          } catch (error) {
            checkTokens.push(normalTokens[i]);
            console.log("Token", i, normalTokens[i], checkTokens.length);
          }
          // refPrice = await CoinGeckoClient.simple.fetchTokenPrice({
          //   contract_addresses: normalTokens[i],
          //   vs_currencies: "usd",
          // })
          // console.log("Reference price:", refPrice)
          // console.log("");
        }
        console.log(checkTokens)

        // for (i=0;i<uniLPs.length;i++) {
        //   console.log("Uni token",i,uniLPs[i]);
        //   try {
        //     console.time("getPrice");
        //     price2 = await oracle.getPrice(uniLPs[i]);
        //     console.timeEnd("getPrice");
        //     console.log("price:", BigNumber(price2).toFixed()/10**precisionDecimals);
        //     console.log("");
        //   } catch {
        //     console.log("Uni", i, uniLPs[i]);
        //     console.log("")
        //   }
        // }
        //
        // for (i=0;i<nSushiPools-1;i++) {
        //   console.log("Sushi token",i,sushiLPs[i]);
        //   try {
        //     console.time("getPrice");
        //     price2 = await oracle.getPrice(sushiLPs[i]);
        //     console.timeEnd("getPrice");
        //     console.log("price:", BigNumber(price2).toFixed()/10**precisionDecimals);
        //     console.log("");
        //   } catch {
        //     console.log("Uni", i, sushiLPs[i]);
        //     console.log("")
        //   }
        // }
        //
        // for (i=0;i<curveLPs.length;i++) {
        //   console.log("Curve token",i, curveLPs[i]);
        //   try {
        //     console.time("getPrice");
        //     price2 = await oracle.getPrice(curveLPs[i]);
        //     console.timeEnd("getPrice");
        //     console.log("price:", BigNumber(price2).toFixed()/10**precisionDecimals);
        //     console.log("");
        //   } catch {
        //     console.log("Uni", i, curveLPs[i]);
        //     console.log("")
        //   }
        // }
        //
        // for (i=0;i<oneInchLPs.length;i++) {
        //   console.log("OneInch token",i,oneInchLPs[i]);
        //   try {
        //     console.time("getPrice");
        //     price2 = await oracle.getPrice(oneInchLPs[i]);
        //     console.timeEnd("getPrice");
        //     console.log("price:", BigNumber(price2).toFixed()/10**precisionDecimals);
        //     console.log("");
        //   } catch {
        //     console.log("Uni", i, oneInchLPs[i]);
        //     console.log("")
        //   }
        // }

      });
    });
  });
}
