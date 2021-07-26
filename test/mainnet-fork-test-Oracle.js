// Utilities
// noinspection JSUndeclaredVariable

const MFC = require("./config/mainnet-fork-test-config.js");
const CoinGecko = require("coingecko-api");
const CoinGeckoClient = new CoinGecko();

const { artifacts, deployments } = require("hardhat");
const BigNumber = require("bignumber.js");
const IUniswapV2Factory = artifacts.require("IUniswapV2Factory");
const ICurveRegistry = artifacts.require("ICurveRegistry");
const IMooniFactory = artifacts.require("IMooniFactory")
const SwapBase = artifacts.require("SwapBase")

const ERC20 = artifacts.require("ERC20")

//const Strategy = artifacts.require("");
const OracleBase = artifacts.require("OracleBase");
const OracleMainnet_old = artifacts.require("OracleMainnet_old");
const assert = require('assert');

// Vanilla Mocha test. Increased compatibility with tools that integrate Mocha.
// noinspection SpellCheckingInspection
describe("Mainnet: Testing all functionality", function (){

  let precisionDecimals = 18;
  // parties in the protocol

  // Core protocol contracts
  let oracle;

  let uniswapFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  let sushiswapFactoryAddress = "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac";
  let curveRegistryAddress = "0x7D86446dDb609eD0F5f8684AcF30380a356b2B4c";
  let oneInchFactoryAddress = "0xbAF9A5d4b0052359326A6CDAb54BABAa3a3A9643";

  let normalTokens = [MFC.FARM_ADDRESS, MFC.renBTC_ADDRESS, MFC.BAC_ADDRESS, MFC.MAAPL_ADDRESS, MFC.UNI_ADDRESS, MFC.SEUR_ADDRESS, MFC.SBTC_ADDRESS, MFC.GRAIN_ADDRESS];
  // noinspection SpellCheckingInspection
  let uniLPs = ["0xbb2b8038a1640196fbe3e38816f3e67cba72d940","0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc","0xd3d2e2692501a5c9ca623199d38826e513033a17","0x21b8065d10f73ee2e260e5b47d3344d3ced7596e",
                // "0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852","0xa478c2975ab1ea89e8196811f51a7b7ade33eb11","0xf52f433b79d21023af94251958bed3b64a2b7930","0xa2107fa5b38d9bbd2c461d6edf11b11a50f6b974",
                "0x97c4adc5d28a86f9470c70dd91dc6cc2f20d2d4d","0x32ce7e48debdccbfe0cd037cc89526e4382cb81b"];
  // noinspection SpellCheckingInspection
  let sushiLPs = ["0xceff51756c56ceffca006cd410b03ffc46dd3a58","0x795065dcc9f64b5614c407a6efdc400da6221fb0","0xc3d03e4f041fd4cd388c549ee2a29a9e5075882f","0x06da0fd433c1a5d7a4faa01111c044910a184553",
                  // "0x397ff1542f962076d0bfe58ea045ffa2d347aca0","0x088ee5007c98a9677165d78dd2109ae4a3d04d0c","0xc40d16476380e4037e6b1a2594caf6a6cc8da967","0xd75ea151a61d06868e31f8988d28dfe5e9df57b4",
                  "0xa1d7b2d891e3a1f9ef4bbc5be20630c2feb1c470","0x110492b31c59716ac47337e616804e3e3adc0b4a"];
  let curveLPs = [];
  // noinspection SpellCheckingInspection
  let oneInchLPs = ["0x6a11F3E5a01D129e566d783A7b6E8862bFD66CcA","0x7566126f2fD0f2Dddae01Bb8A6EA49b760383D5A","0xbBa17b81aB4193455Be10741512d0E71520F43cB","0xb4dB55a20E0624eDD82A0Cf356e3488B4669BD27",
                    "0x0EF1B8a0E726Fc3948E15b23993015eB1627f210","0x9696D4999a25766719D0e80294F93bB62A5a3178","0x822E00A929f5A92F3565A16f92581e54af2b90Ea","0x1f629794B34FFb3B29FF206Be5478A52678b47ae"
  ];

  // noinspection SpellCheckingInspection
  const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
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
  // noinspection SpellCheckingInspection
  // let pricingTokens = [
  // "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", //USDC
  // "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", //WETH
  // "0x6B175474E89094C44Da98b954EedeAC495271d0F", //DAI
  // "0xdAC17F958D2ee523a2206206994597C13D831ec7", //USDT
  // "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", //WBTC
  // "0xdB25f211AB05b1c97D595516F45794528a807ad8"  //EURS
  // ];
  // let definedOutputToken = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; //USDC
  let governance;

  before(async function () {
    console.log("Setting up contract")
    const {deployer} = await getNamedAccounts();
    governance = deployer;
    await deployments.fixture(); // Execute deployment
    // Oracle
    const Oracle = await deployments.get('OracleBase'); // Oracle is available because the fixture was executed
    oracle = await OracleBase.at(Oracle.address);

    uniswapFactory   = await IUniswapV2Factory.at(uniswapFactoryAddress);
    sushiswapFactory = await IUniswapV2Factory.at(sushiswapFactoryAddress);
    curveRegistry    = await ICurveRegistry.at(curveRegistryAddress);
    oneInchFactory   = await IMooniFactory.at(oneInchFactoryAddress);
  });

  it("Production Tokens", async function () {
    const tokens = require("./config/production-tokens-mainnet.js");
    const oldOracle = await OracleMainnet_old.new({from: governance})
    for (const token in tokens) {
      if (!tokens.hasOwnProperty(token)) continue;
      const tokenName = tokens[token];
      console.log('token', token, tokenName);
      try {
        const oldPrice = await oldOracle.getPrice(token);
        const newPrice = await oracle.getPrice(token);
        const equal = newPrice.eq(oldPrice)
        console.log(equal ? '+ equal' : '-NOT EQUAL!!!')
        if (!equal) {
          console.log('newPrice', newPrice.toString());
          console.log('oldPrice', oldPrice.toString());
        }
        assert(equal, 'New oracle price must be equal old oracle price')
      } catch(e) {
        console.log('Exception:', e);
        //TODO at production-tokens.js we have few addresses that treated as non-contract accounts
      }
      console.log('');
    }

  })
  it("Normal Tokens", async function () {
    checkTokens = [
    ]
    let refPrice, price;
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

      try {
        const refPriceRaw = await CoinGeckoClient.simple.fetchTokenPrice({
          contract_addresses: checkTokens[i],
          vs_currencies: "usd",
        })
        address = checkTokens[i].toLowerCase();
        refPrice = refPriceRaw["data"][address]["usd"];
      } catch (error) {
        refPrice = undefined;
      }
      console.log("Coingecko price:", refPrice);
      if (refPrice && price){
        console.log("Diff:", ((price/10**precisionDecimals-refPrice)/refPrice*100).toFixed(2), "%");
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
      try {
        refPriceRaw = await CoinGeckoClient.simple.fetchTokenPrice({
          contract_addresses: keyTokens[i],
          vs_currencies: "usd",
        })
        address = keyTokens[i].toLowerCase();
        refPrice = refPriceRaw["data"][address]["usd"];
      } catch (error) {
        refPrice = undefined;
      }
      console.log("Coingecko price:", refPrice);
      if (refPrice && price){
        console.log("Diff:", ((price/10**precisionDecimals-refPrice)/refPrice*100).toFixed(2), "%");
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
      try {
        refPriceRaw = await CoinGeckoClient.simple.fetchTokenPrice({
          contract_addresses: normalTokens[i],
          vs_currencies: "usd",
        })
        address = normalTokens[i].toLowerCase();
        refPrice = refPriceRaw["data"][address]["usd"];
      } catch (error) {
        refPrice = undefined;
      }
      console.log("Coingecko price:", refPrice);
      if (refPrice && price){
        console.log("Diff:", ((price/10**precisionDecimals-refPrice)/refPrice*100).toFixed(2), "%");
      }
      console.log("");
    }
  });


  it("UniswapV3 Key Tokens", async function () {
    address0 = "0x0000000000000000000000000000000000000000"
    const univ2swapAddress = await oracle.swaps(0); // uniswapV2 1st at the swaps list
    const univ3swapAddress = await oracle.swaps(4); // uniswapV3 5th at the swaps list
    console.log('univ3swapAddress', univ3swapAddress);
    const univ3 = await SwapBase.at(univ3swapAddress);
    const univ2 = await SwapBase.at(univ2swapAddress);
    let refPrice, price, price2;
    for (i=1;i<keyTokens.length;i++) {
      const token = keyTokens[i];
      const erc = await ERC20.at(token)
      const symbol = await erc.symbol()
      console.log(symbol, "Key Token",i,token);
      try {
        console.time("getPrice");
        // price = await oracle.getPrice(keyTokens[i]);
        price  = await univ3.getPriceVsToken(token, USDC,address0);
        price2 = await univ2.getPriceVsToken(token, USDC,address0);
        console.timeEnd("getPrice");
        console.log("uniV2 price:", (BigNumber(price2)/10**precisionDecimals).toFixed(4));
        console.log("uniV3 price:", (BigNumber(price )/10**precisionDecimals).toFixed(4));
        const diff = ((price-price2)/price2)*100;
        console.log("v2/v3 Diff:", diff.toFixed(2)+"%", Math.abs(diff)<15 ? 'ok' : 'TOO BIG!!!!!!!');
      } catch (error) {
        console.log('error', error);
        price = 0;
        console.log("Error at Token", i, keyTokens[i]);
      }
      try {
        refPriceRaw = await CoinGeckoClient.simple.fetchTokenPrice({
          contract_addresses: token,
          vs_currencies: "usd",
        })
        address = token.toLowerCase();
        refPrice = refPriceRaw["data"][address]["usd"];
      } catch (error) {
        refPrice = undefined;
      }
      console.log("Coingecko price:", refPrice);
      if (refPrice && price){
        const diff = (price/10**precisionDecimals-refPrice)/refPrice*100;
        console.log("Diff:", diff.toFixed(2)+"%", Math.abs(diff)<15 ? 'ok' : 'TOO BIG!!!!!!!');
      }
      console.log("");
    }

  });

  it("Uni LPs Repeatable", async function() {
    for (i=0;i<uniLPs.length;i++) {
      let price;
      console.log("Uni token",i,uniLPs[i]);
      try {
        console.time("getPrice");
        price = await oracle.getPrice(uniLPs[i]);
        console.timeEnd("getPrice");
        console.log("price:", BigNumber(price).toFixed()/10**precisionDecimals);
      } catch {
        console.log("Uni", i, uniLPs[i]);
      }

      const swapAddress = await oracle.swaps(0); // Swap at index 0 - UniSwap
      const swap = await SwapBase.at(swapAddress)
      const underlying = await swap.getUnderlying(uniLPs[i]);
      const token0 = underlying[0][0].toLowerCase();
      const token1 = underlying[0][1].toLowerCase();
      const amount0 = BigNumber(underlying[1][0]).toFixed();
      const amount1 = BigNumber(underlying[1][1]).toFixed();

      let refPrice0, refPrice1;
      try {
        const refPriceRaw0 = await CoinGeckoClient.simple.fetchTokenPrice({
          contract_addresses: token0,
          vs_currencies: "usd",
        })
        refPrice0 = refPriceRaw0["data"][token0]["usd"];
      } catch (error) {
        refPrice0 = undefined;
      }
      try {
        const refPriceRaw1 = await CoinGeckoClient.simple.fetchTokenPrice({
          contract_addresses: token1,
          vs_currencies: "usd",
        })
        refPrice1 = refPriceRaw1["data"][token1]["usd"];
      } catch (error) {
        refPrice1 = undefined;
      }
      refPrice = amount0*refPrice0/10**precisionDecimals + amount1*refPrice1/10**precisionDecimals;
      if (!refPrice0 || !refPrice1) {
        refPrice = undefined;
      }
      console.log("Coingecko price:", refPrice);
      if (refPrice && price){
        console.log("Diff:", ((price/10**precisionDecimals-refPrice)/refPrice*100).toFixed(2), "%");
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


      const swapAddress = await oracle.swaps(1); // Swap at index 1 - SushiSwap
      const swap = await SwapBase.at(swapAddress)
      const underlying = await swap.getUnderlying(sushiLPs[i]);
      token0 = underlying[0][0].toLowerCase();
      token1 = underlying[0][1].toLowerCase();
      amount0 = BigNumber(underlying[1][0]).toFixed();
      amount1 = BigNumber(underlying[1][1]).toFixed();

      let refPrice0, refPrice1;
      try {
        const refPriceRaw0 = await CoinGeckoClient.simple.fetchTokenPrice({
          contract_addresses: token0,
          vs_currencies: "usd",
        })
        refPrice0 = refPriceRaw0["data"][token0]["usd"];
      } catch (error) {
        refPrice0 = undefined;
      }
      try {
        const refPriceRaw1 = await CoinGeckoClient.simple.fetchTokenPrice({
          contract_addresses: token1,
          vs_currencies: "usd",
        })
        refPrice1 = refPriceRaw1["data"][token1]["usd"];
      } catch (error) {
        refPrice1 = undefined;
      }
      refPrice = amount0*refPrice0/10**precisionDecimals + amount1*refPrice1/10**precisionDecimals;
      if (!refPrice0 || !refPrice1) {
        refPrice = 0;
      }
      console.log("Coingecko price:", refPrice);
      if (refPrice && price){
        console.log("Diff:", ((price/10**precisionDecimals-refPrice)/refPrice*100).toFixed(2), "%");
      }
      console.log("")

    }
  });

  it("Curve LPs Repeatable", async function() {
    for (i=22;i<8;i++) {
      pool = await curveRegistry.pool_list(i);
      lpToken = await curveRegistry.get_lp_token(pool);
      curveLPs.push(lpToken);
    }
    console.log("Curve setup done");

    for (i=0;i<curveLPs.length;i++) {
      let price;
      console.log("Curve token",i, curveLPs[i]);
      try {
        console.time("getPrice");
        price = await oracle.getPrice(curveLPs[i]);
        console.timeEnd("getPrice");
        console.log("price:", BigNumber(price).toFixed()/10**precisionDecimals);
      } catch {
        console.log("Uni", i, curveLPs[i]);
      }

      const swapAddress = await oracle.swaps(2); // Swap at index 2 - CurveSwap
      const swap = await SwapBase.at(swapAddress)
      const underlying = await swap.getUnderlying(curveLPs[i]);
      let refPrice = 0;
      let refPriceUnderlying;
      for (j=0;j<8;j++) {
        token = underlying[0][j].toLowerCase();
        if (token === MFC.ZERO_ADDRESS) {
          break;
        }
        amount = underlying[1][j];
        try {
          const refPriceRaw = await CoinGeckoClient.simple.fetchTokenPrice({
            contract_addresses: token,
            vs_currencies: "usd",
          })
          refPriceUnderlying = refPriceRaw["data"][token]["usd"];
        } catch (error) {
          refPrice = undefined;
          break;
        }
        refPrice = refPrice + refPriceUnderlying*amount/10**precisionDecimals;
      }
      console.log("Coingecko price:", refPrice);
      if (refPrice && price){
        console.log("Diff:", ((price/10**precisionDecimals-refPrice)/refPrice*100).toFixed(2), "%");
      }
      console.log("")
    }
  });

  it("1Inch LPs Repeatable", async function() {
    for (i=0;i<oneInchLPs.length;i++) {
      let price;
      console.log("OneInch token",i,oneInchLPs[i]);
      try {
        console.time("getPrice");
        price = await oracle.getPrice(oneInchLPs[i]);
        console.timeEnd("getPrice");
        console.log("price:", BigNumber(price).toFixed()/10**precisionDecimals);
      } catch {
        console.log("Uni", i, oneInchLPs[i]);
      }

      const swapAddress = await oracle.swaps(3); // Swap at index 3 - OneInchSwap
      const swap = await SwapBase.at(swapAddress)
      const underlying = await swap.getUnderlying(oneInchLPs[i]);
      token0 = underlying[0][0].toLowerCase();
      token1 = underlying[0][1].toLowerCase();
      amount0 = BigNumber(underlying[1][0]).toFixed();
      amount1 = BigNumber(underlying[1][1]).toFixed();
      let refPrice, refPrice0, refPrice1;
      try {
        const refPriceRaw0 = await CoinGeckoClient.simple.fetchTokenPrice({
          contract_addresses: token0,
          vs_currencies: "usd",
        })
        refPrice0 = refPriceRaw0["data"][token0]["usd"];
      } catch (error) {
        refPrice0 = undefined;
      }
      try {
        const refPriceRaw1 = await CoinGeckoClient.simple.fetchTokenPrice({
          contract_addresses: token1,
          vs_currencies: "usd",
        })
        refPrice1 = refPriceRaw1["data"][token1]["usd"];
      } catch (error) {
        refPrice1 = undefined;
      }
      refPrice = amount0*refPrice0/10**precisionDecimals + amount1*refPrice1/10**precisionDecimals;
      if (!refPrice0 || !refPrice1 ) {
        refPrice = undefined;
      }
      console.log("Coingecko price:", refPrice);
      if (refPrice && price ){
        console.log("Diff:", ((price/10**precisionDecimals-refPrice)/refPrice*100).toFixed(2), "%");
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

    ethPrice = await oracle.getPrice(MFC.WETH_ADDRESS, {from: governance});
    console.log("WETH price:", BigNumber(ethPrice).toFixed()/10**precisionDecimals);
    usdcPrice = await oracle.getPrice(MFC.USDC_ADDRESS, {from: governance});
    console.log("USDC price:", BigNumber(usdcPrice).toFixed()/10**precisionDecimals);

    console.log("Change defined output to WETH");
    await oracle.changeDefinedOutput(MFC.WETH_ADDRESS, {from: governance});
    ethPrice = await oracle.getPrice(MFC.WETH_ADDRESS, {from: governance});
    console.log("WETH price:", BigNumber(ethPrice).toFixed()/10**precisionDecimals);
    usdcPrice = await oracle.getPrice(MFC.USDC_ADDRESS, {from: governance});
    console.log("USDC price:", BigNumber(usdcPrice).toFixed()/10**precisionDecimals);
  });

});
