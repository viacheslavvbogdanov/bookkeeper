// Utilities
const Utils = require("./utilities/Utils.js");
const MFC = require("./mainnet-fork-test-config.js");
const CoinGecko = require("coingecko-api");
const CoinGeckoClient = new CoinGecko();

const { send } = require("@openzeppelin/test-helpers");
const BigNumber = require("bignumber.js");
const IERC20 = artifacts.require("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20");
const ERC20 = artifacts.require("ERC20")
const IUniswapV2Factory = artifacts.require("IUniswapV2Factory");
const IUniswapV2Pair = artifacts.require("IUniswapV2Pair");
const ICurveRegistry = artifacts.require("ICurveRegistry");
const ICurvePool = artifacts.require("ICurvePool")
const IMooniFactory = artifacts.require("IMooniFactory")

//const Strategy = artifacts.require("");
const Storage = artifacts.require("Storage");
const OracleMainnet = artifacts.require("OracleMainnet");

// Vanilla Mocha test. Increased compatibility with tools that integrate Mocha.
describe("Testing all functionality", function (){

  function sum(total,num) {
    return BigNumber.sum(total,num);
  }
  let accounts;
  let precisionDecimals = 18;
  // parties in the protocol

  // Core protocol contracts
  let storage;
  let oracle;

  let uniswapFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  let sushiswapFactoryAddress = "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac";
  let curveRegistryAddress = "0x7D86446dDb609eD0F5f8684AcF30380a356b2B4c";
  let oneInchFactoryAddress = "0xbAF9A5d4b0052359326A6CDAb54BABAa3a3A9643";

  let normalTokens = [MFC.FARM_ADDRESS, MFC.renBTC_ADDRESS, MFC.BAC_ADDRESS, MFC.MAAPL_ADDRESS, MFC.UNI_ADDRESS, MFC.MIS_ADDRESS, MFC.SEUR_ADDRESS, MFC.SBTC_ADDRESS, MFC.GRAIN_ADDRESS];
  let uniLPs = ["0xbb2b8038a1640196fbe3e38816f3e67cba72d940","0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc","0xd3d2e2692501a5c9ca623199d38826e513033a17","0x21b8065d10f73ee2e260e5b47d3344d3ced7596e",
                "0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852","0xa478c2975ab1ea89e8196811f51a7b7ade33eb11","0xf52f433b79d21023af94251958bed3b64a2b7930","0xa2107fa5b38d9bbd2c461d6edf11b11a50f6b974",
                "0x97c4adc5d28a86f9470c70dd91dc6cc2f20d2d4d","0x32ce7e48debdccbfe0cd037cc89526e4382cb81b"];
  let sushiLPs = ["0xceff51756c56ceffca006cd410b03ffc46dd3a58","0x795065dcc9f64b5614c407a6efdc400da6221fb0","0xc3d03e4f041fd4cd388c549ee2a29a9e5075882f","0x06da0fd433c1a5d7a4faa01111c044910a184553",
                  "0x397ff1542f962076d0bfe58ea045ffa2d347aca0","0x088ee5007c98a9677165d78dd2109ae4a3d04d0c","0xc40d16476380e4037e6b1a2594caf6a6cc8da967","0xd75ea151a61d06868e31f8988d28dfe5e9df57b4",
                  "0xa1d7b2d891e3a1f9ef4bbc5be20630c2feb1c470","0x110492b31c59716ac47337e616804e3e3adc0b4a"];
  let curveLPs = [];
  let oneInchLPs = ["0x6a11F3E5a01D129e566d783A7b6E8862bFD66CcA","0x7566126f2fD0f2Dddae01Bb8A6EA49b760383D5A","0xbBa17b81aB4193455Be10741512d0E71520F43cB","0xb4dB55a20E0624eDD82A0Cf356e3488B4669BD27",
                    "0x0EF1B8a0E726Fc3948E15b23993015eB1627f210","0x9696D4999a25766719D0e80294F93bB62A5a3178","0x822E00A929f5A92F3565A16f92581e54af2b90Ea","0x1f629794B34FFb3B29FF206Be5478A52678b47ae"];

  let keyTokens = [
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", //USDC
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", //WETH
  "0x6B175474E89094C44Da98b954EedeAC495271d0F", //DAI
  "0xdAC17F958D2ee523a2206206994597C13D831ec7", //USDT
  "0xa47c8bf37f92aBed4A126BDA807A7b7498661acD", //UST
  "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", //WBTC
  "0xdB25f211AB05b1c97D595516F45794528a807ad8", //EURS
  "0x514910771AF9Ca656af840dff83E8264EcF986CA"  //LINK

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

  before(async function () {
    console.log("Setting up contract")
    accounts = await web3.eth.getAccounts();
    governance = accounts[1];
    // deploy storage
    storage = await Storage.new({ from: governance });
    //deploy Oracle
    oracle = await OracleMainnet.new(storage.address, {from: governance});

    uniswapFactory = await IUniswapV2Factory.at(uniswapFactoryAddress);
    sushiswapFactory = await IUniswapV2Factory.at(sushiswapFactoryAddress);
    curveRegistry = await ICurveRegistry.at(curveRegistryAddress);
    oneInchFactory = await IMooniFactory.at(oneInchFactoryAddress);
  });

  it("Normal Tokens", async function () {
    checkTokens = [
    ]

    for (i=0;i<checkTokens.length;i++) {
      console.log("Check Token",i,checkTokens[i]);
      try {
        console.time("getPrice");
        price = await oracle.getPrice(checkTokens[i]);
        console.timeEnd("getPrice");
        console.log("price:", BigNumber(price).toFixed()/10**precisionDecimals);
      } catch (error) {
        price = 0;
        console.log("Error at Token", i, checkTokens[i]);
      }
      refPriceRaw = await CoinGeckoClient.simple.fetchTokenPrice({
        contract_addresses: checkTokens[i],
        vs_currencies: "usd",
      })
      address = checkTokens[i].toLowerCase();
      try {
        refPrice = refPriceRaw["data"][address]["usd"];
      } catch (error) {
        refPrice = 0;
      }
      console.log("Coingecko price:", refPrice);
      if (refPrice != 0 && price != 0){
        console.log("Diff:", (price/10**precisionDecimals-refPrice)/refPrice*100, "%");
      }
      console.log("");
    }

    for (i=0;i<keyTokens.length;i++) {
      console.log("Key Token",i,keyTokens[i]);
      try {
        console.time("getPrice");
        price = await oracle.getPrice(keyTokens[i]);
        console.timeEnd("getPrice");
        console.log("price:", BigNumber(price).toFixed()/10**precisionDecimals);
      } catch (error) {
        price = 0;
        console.log("Error at Token", i, keyTokens[i]);
      }
      refPriceRaw = await CoinGeckoClient.simple.fetchTokenPrice({
        contract_addresses: keyTokens[i],
        vs_currencies: "usd",
      })
      address = keyTokens[i].toLowerCase();
      try {
        refPrice = refPriceRaw["data"][address]["usd"];
      } catch (error) {
        refPrice = 0;
      }
      console.log("Coingecko price:", refPrice);
      if (refPrice != 0 && price != 0){
        console.log("Diff:", (price/10**precisionDecimals-refPrice)/refPrice*100, "%");
      }
      console.log("");
    }

    for (i=0;i<normalTokens.length;i++) {
      console.log("Token",i,normalTokens[i]);
      try {
        console.time("getPrice");
        price = await oracle.getPrice(normalTokens[i]);
        console.timeEnd("getPrice");
        console.log("price:", BigNumber(price).toFixed()/10**precisionDecimals);
      } catch (error) {
        price = 0;
        console.log("Error at Token", i, normalTokens[i]);
      }
      refPriceRaw = await CoinGeckoClient.simple.fetchTokenPrice({
        contract_addresses: normalTokens[i],
        vs_currencies: "usd",
      })
      address = normalTokens[i].toLowerCase();
      try {
        refPrice = refPriceRaw["data"][address]["usd"];
      } catch (error) {
        refPrice = 0;
      }
      console.log("Coingecko price:", refPrice);
      if (refPrice != 0 && price != 0){
        console.log("Diff:", (price/10**precisionDecimals-refPrice)/refPrice*100, "%");
      }
      console.log("");
    }
  });

  it("Uni LPs Repeatable", async function() {
    for (i=0;i<uniLPs.length;i++) {
      console.log("Uni token",i,uniLPs[i]);
      try {
        console.time("getPrice");
        price = await oracle.getPrice(uniLPs[i]);
        console.timeEnd("getPrice");
        console.log("price:", BigNumber(price).toFixed()/10**precisionDecimals);
      } catch {
        console.log("Uni", i, uniLPs[i]);
      }

      underlying = await oracle.getUniUnderlying(uniLPs[i]);
      token0 = underlying[0][0].toLowerCase();
      token1 = underlying[0][1].toLowerCase();
      amount0 = BigNumber(underlying[1][0]).toFixed();
      amount1 = BigNumber(underlying[1][1]).toFixed();

      refPriceRaw0 = await CoinGeckoClient.simple.fetchTokenPrice({
        contract_addresses: token0,
        vs_currencies: "usd",
      })
      try {
        refPrice0 = refPriceRaw0["data"][token0]["usd"];
      } catch (error) {
        refPrice0 = 0;
      }
      refPriceRaw1 = await CoinGeckoClient.simple.fetchTokenPrice({
        contract_addresses: token1,
        vs_currencies: "usd",
      })
      try {
        refPrice1 = refPriceRaw1["data"][token1]["usd"];
      } catch (error) {
        refPrice1 = 0;
      }
      refPrice = amount0*refPrice0/10**precisionDecimals + amount1*refPrice1/10**precisionDecimals;
      if (refPrice0 == 0 || refPrice1 == 0) {
        refPrice = 0;
      }
      console.log("Coingecko price:", refPrice);
      if (refPrice != 0 && price != 0){
        console.log("Diff:", (price/10**precisionDecimals-refPrice)/refPrice*100, "%");
      }
      console.log("")
    }
  });

  it("Sushi LPs Repeatable", async function() {
    for (i=0;i<sushiLPs.length;i++) {
      console.log("Sushi token",i,sushiLPs[i]);
      try {
        console.time("getPrice");
        price = await oracle.getPrice(sushiLPs[i]);
        console.timeEnd("getPrice");
        console.log("price:", BigNumber(price).toFixed()/10**precisionDecimals);
      } catch {
        console.log("Uni", i, sushiLPs[i]);
      }

      underlying = await oracle.getUniUnderlying(sushiLPs[i]);
      token0 = underlying[0][0].toLowerCase();
      token1 = underlying[0][1].toLowerCase();
      amount0 = BigNumber(underlying[1][0]).toFixed();
      amount1 = BigNumber(underlying[1][1]).toFixed();

      refPriceRaw0 = await CoinGeckoClient.simple.fetchTokenPrice({
        contract_addresses: token0,
        vs_currencies: "usd",
      })
      try {
        refPrice0 = refPriceRaw0["data"][token0]["usd"];
      } catch (error) {
        refPrice0 = 0;
      }
      refPriceRaw1 = await CoinGeckoClient.simple.fetchTokenPrice({
        contract_addresses: token1,
        vs_currencies: "usd",
      })
      try {
        refPrice1 = refPriceRaw1["data"][token1]["usd"];
      } catch (error) {
        refPrice1 = 0;
      }
      refPrice = amount0*refPrice0/10**precisionDecimals + amount1*refPrice1/10**precisionDecimals;
      if (refPrice0 == 0 || refPrice1 == 0) {
        refPrice = 0;
      }
      console.log("Coingecko price:", refPrice);
      if (refPrice != 0 && price != 0){
        console.log("Diff:", (price/10**precisionDecimals-refPrice)/refPrice*100, "%");
      }
      console.log("")

    }
  });

  it("Curve LPs Repeatable", async function() {
    for (i=0;i<10;i++) {
      pool = await curveRegistry.pool_list(i);
      lpToken = await curveRegistry.get_lp_token(pool);
      curveLPs.push(lpToken);
    }
    console.log("Curve setup done");

    for (i=0;i<curveLPs.length;i++) {
      console.log("Curve token",i, curveLPs[i]);
      try {
        console.time("getPrice");
        price = await oracle.getPrice(curveLPs[i]);
        console.timeEnd("getPrice");
        console.log("price:", BigNumber(price).toFixed()/10**precisionDecimals);
      } catch {
        console.log("Uni", i, curveLPs[i]);
      }

      underlying = await oracle.getCurveUnderlying(curveLPs[i]);
      refPrice = 0;
      for (j=0;j<8;j++) {
        token = underlying[0][j].toLowerCase();
        if (token == MFC.ZERO_ADDRESS) {
          break;
        }
        amount = underlying[1][j];
        refPriceRaw = await CoinGeckoClient.simple.fetchTokenPrice({
          contract_addresses: token,
          vs_currencies: "usd",
        })
        try {
          refPriceUnderlying = refPriceRaw["data"][token]["usd"];
        } catch (error) {
          refPrice = 0;
          break;
        }
        refPrice = refPrice + refPriceUnderlying*amount/10**precisionDecimals;
      }
      console.log("Coingecko price:", refPrice);
      if (refPrice != 0 && price != 0){
        console.log("Diff:", (price/10**precisionDecimals-refPrice)/refPrice*100, "%");
      }
      console.log("")
    }
  });

  it("1Inch LPs Repeatable", async function() {
    for (i=0;i<oneInchLPs.length;i++) {
      console.log("OneInch token",i,oneInchLPs[i]);
      try {
        console.time("getPrice");
        price = await oracle.getPrice(oneInchLPs[i]);
        console.timeEnd("getPrice");
        console.log("price:", BigNumber(price).toFixed()/10**precisionDecimals);
      } catch {
        console.log("Uni", i, oneInchLPs[i]);
      }

      underlying = await oracle.getOneInchUnderlying(oneInchLPs[i]);
      token0 = underlying[0][0].toLowerCase();
      token1 = underlying[0][1].toLowerCase();
      amount0 = BigNumber(underlying[1][0]).toFixed();
      amount1 = BigNumber(underlying[1][1]).toFixed();

      refPriceRaw0 = await CoinGeckoClient.simple.fetchTokenPrice({
        contract_addresses: token0,
        vs_currencies: "usd",
      })
      try {
        refPrice0 = refPriceRaw0["data"][token0]["usd"];
      } catch (error) {
        refPrice0 = 0;
      }
      refPriceRaw1 = await CoinGeckoClient.simple.fetchTokenPrice({
        contract_addresses: token1,
        vs_currencies: "usd",
      })
      try {
        refPrice1 = refPriceRaw1["data"][token1]["usd"];
      } catch (error) {
        refPrice1 = 0;
      }
      refPrice = amount0*refPrice0/10**precisionDecimals + amount1*refPrice1/10**precisionDecimals;
      if (refPrice0 == 0 || refPrice1 == 0) {
        refPrice = 0;
      }
      console.log("Coingecko price:", refPrice);
      if (refPrice != 0 && price != 0){
        console.log("Diff:", (price/10**precisionDecimals-refPrice)/refPrice*100, "%");
      }
      console.log("")
    }
  });

  it("Control functions", async function() {
    console.log("Change factories");
    await oracle.changeUniFactory(sushiswapFactoryAddress, {from: governance});
    await oracle.changeSushiFactory(uniswapFactoryAddress, {from: governance});
    await oracle.changeCurveRegistry(oneInchFactoryAddress, {from: governance});
    await oracle.changeOneInchFactory(curveRegistryAddress, {from: governance});
    console.log("Change back");
    await oracle.changeUniFactory(uniswapFactoryAddress, {from: governance});
    await oracle.changeSushiFactory(sushiswapFactoryAddress, {from: governance});
    await oracle.changeCurveRegistry(curveRegistryAddress, {from: governance});
    await oracle.changeOneInchFactory(oneInchFactoryAddress, {from: governance});
    console.log("Add FARM as key token");
    await oracle.addKeyToken(MFC.FARM_ADDRESS, {from: governance});
    isKeyToken = await oracle.checkKeyToken(MFC.FARM_ADDRESS, {from: governance});
    console.log("FARM is key token:",isKeyToken);
    console.log("Add FARM as pricing token");
    await oracle.addPricingToken(MFC.FARM_ADDRESS, {from: governance});
    isPricingToken = await oracle.checkPricingToken(MFC.FARM_ADDRESS, {from: governance});
    console.log("FARM is pricing token:", isPricingToken);
    console.log("Remove FARM as key token");
    await oracle.removeKeyToken(MFC.FARM_ADDRESS, {from: governance});
    isKeyToken = await oracle.checkKeyToken(MFC.FARM_ADDRESS, {from: governance});
    console.log("FARM is key token:",isKeyToken);
    isPricingToken = await oracle.checkPricingToken(MFC.FARM_ADDRESS, {from: governance});
    console.log("FARM is pricing token:", isPricingToken);
    console.log("Change defined output to WETH");
    await oracle.changeDefinedOutput(MFC.WETH_ADDRESS, {from: governance});
    ethPrice = await oracle.getPrice(MFC.WETH_ADDRESS, {from: governance});
    console.log("WETH price:", BigNumber(ethPrice).toFixed()/10**precisionDecimals);
    usdcPrice = await oracle.getPrice(MFC.USDC_ADDRESS, {from: governance});
    console.log("USDC price:", BigNumber(usdcPrice).toFixed()/10**precisionDecimals);
  });

});
