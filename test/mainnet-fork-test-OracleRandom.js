// Utilities
const Utils = require("./utilities/Utils.js");
const MFC = require("./config/mainnet-fork-test-config.js");
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
  let oracle;

  let uniswapFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  let sushiswapFactoryAddress = "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac";
  let curveRegistryAddress = "0x7D86446dDb609eD0F5f8684AcF30380a356b2B4c";
  let oneInchFactoryAddress = "0xbAF9A5d4b0052359326A6CDAb54BABAa3a3A9643";

  let normalTokens=[];
  let uniLPs=[];
  let sushiLPs=[];
  let curveLPs=[];
  let oneInchLPs=[];

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
    //deploy Oracle
    oracle = await OracleMainnet.new({from: governance});

    uniswapFactory = await IUniswapV2Factory.at(uniswapFactoryAddress);
    sushiswapFactory = await IUniswapV2Factory.at(sushiswapFactoryAddress);
    curveRegistry = await ICurveRegistry.at(curveRegistryAddress);
    oneInchFactory = await IMooniFactory.at(oneInchFactoryAddress);

    nNormalTokens = 100;
    nUniPools = 100;
    nSushiPools = 100;
    nCurvePools = await curveRegistry.pool_count();
    oneInchLPs = await oneInchFactory.getAllPools();
    nOneInchLPs = oneInchLPs.length;

    console.log("Running through:");
    console.log(nNormalTokens, "normal tokens");
    console.log(nUniPools, "Uni pools");
    console.log(nSushiPools, "Sushi pools");
    console.log(BigNumber(nCurvePools).toFixed(), "Curve pools");
    console.log(nOneInchLPs, "1Inch pools");

    nUniPoolsTotal = await uniswapFactory.allPairsLength();
    nUniPoolsTotal = BigNumber(nUniPoolsTotal).toFixed();

    nSushiPoolsTotal = await sushiswapFactory.allPairsLength();
    nSushiPoolsTotal = BigNumber(nSushiPoolsTotal).toFixed();

    console.log("Fetch normal tokens");
    while (normalTokens.length < nNormalTokens+1) {
      i = Math.floor(Math.random()*nUniPoolsTotal);
      pair = await uniswapFactory.allPairs(i);
      pair = await IUniswapV2Pair.at(pair);
      token0 = await pair.token0();
      token1 = await pair.token1();
      check0 = true;
      check1 = true;
      for (j=0;j<normalTokens.length;j++) {
        if (normalTokens[j] == token0) {
          check0 = false;
        }
        if (normalTokens[j] == token1) {
          check1 = false;
        }
      }
      if (check0) {
        normalTokens.push(token0);
      }
      if (check1) {
        normalTokens.push(token1);
      }
    }
    console.log("Normal tokens done");

    console.log("Fetch Uni pools");
    for (i=0;i<nUniPools;i++) {
      j = Math.floor(Math.random()*nUniPoolsTotal);
      pair = await uniswapFactory.allPairs(j);
      uniLPs.push(pair);
    }
    console.log("Uni pools done");

    console.log("Fetch Sushi pools");
    while (sushiLPs.length < nSushiPools+1) {
      j = Math.floor(Math.random()*nSushiPoolsTotal);
      pair = await sushiswapFactory.allPairs(j);
      check = true;
      for (k=0;k<sushiLPs.length;k++) {
        if (pair == sushiLPs[k]) {
          check = false;
          break;
        }
      }
      if (check) {
        sushiLPs.push(pair);
      }
    }
    console.log("Sushi pools done");

    console.log("Fetching Curve pools");
    for (i=0;i<nCurvePools;i++) {
      pool = await curveRegistry.pool_list(i);
      lpToken = await curveRegistry.get_lp_token(pool);
      curveLPs.push(lpToken);
    }
    console.log("Curve pools done");
  });

  it("Normal Tokens", async function () {

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
        price = 0;
        console.log("Error at Uni", i, uniLPs[i]);
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
        price = 0;
        console.log("Error at Sushi", i, sushiLPs[i]);
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

    for (i=0;i<curveLPs.length;i++) {
      console.log("Curve token",i, curveLPs[i]);
      try {
        console.time("getPrice");
        price = await oracle.getPrice(curveLPs[i]);
        console.timeEnd("getPrice");
        console.log("price:", BigNumber(price).toFixed()/10**precisionDecimals);
      } catch {
        price = 0;
        console.log("Error at Curve", i, curveLPs[i]);
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
        price = 0;
        console.log("Error at 1Inch", i, oneInchLPs[i]);
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
