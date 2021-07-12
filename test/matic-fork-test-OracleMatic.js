// Utilities
// noinspection JSUndeclaredVariable

const MFC = require("./config/mainnet-fork-test-config.js");
const { artifacts, deployments } = require("hardhat");
const BigNumber = require("bignumber.js");
const ERC20 = artifacts.require("ERC20")
const IUniswapV2Factory = artifacts.require("IUniswapV2Factory");
const SwapBase = artifacts.require("SwapBase")
const OracleBase = artifacts.require("OracleBase");
const OracleMatic_old = artifacts.require("OracleMatic_old");

const assert = require('assert');

// Vanilla Mocha test. Increased compatibility with tools that integrate Mocha.
describe("MATIC: Testing all functionality", function () {

  let accounts;
  let precisionDecimals = 18;
  // parties in the protocol

  // Core protocol contracts
  let oracle;

  let quickswapFactoryAddress = "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32";
  // noinspection SpellCheckingInspection
  let sushiswapFactoryAddress = "0xc35DADB65012eC5796536bD9864eD8773aBc74C4";
  let waultswapFactoryAddress = "0xa98ea6356A316b44Bf710D5f9b6b4eA0081409Ef";

  let keyTokens = {
    'USDC': "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    'WETH': "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    'DAI' : "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    'USDT': "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    'WBTC': "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
  };

  let sushiswapFactory, quickswapFactory, waultswapFactory;
  let governance;

  before(async function () {
    console.log("Setting up contract")
    const {deployer} = await getNamedAccounts();
    governance = deployer;
    await deployments.fixture(); // Execute deployment
    // Oracle
    const Oracle = await deployments.get('OracleBase'); // Oracle is available because the fixture was executed
    oracle = await OracleBase.at(Oracle.address);

    sushiswapFactory = await IUniswapV2Factory.at(sushiswapFactoryAddress);
    quickswapFactory = await IUniswapV2Factory.at(quickswapFactoryAddress);
    waultswapFactory = await IUniswapV2Factory.at(waultswapFactoryAddress);
  });


  it("Production Tokens", async function () {
    const tokens = require("./config/production-tokens-matic.js");
    const oldOracle = await OracleMatic_old.new({from: governance})
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

    for (const tokenName in keyTokens) {
      console.log('tokenName', tokenName)
      const token = keyTokens[tokenName]
      console.log('token', token)
      try {
        console.time("getPrice");
        price = await oracle.getPrice(token);
        console.timeEnd("getPrice");
        console.log("price:", BigNumber(price).toFixed()/10**precisionDecimals);
      } catch (error) {
        price = undefined;
        console.log("Error at Token", tokenName, token, error);
      }
      console.log("");
    }

  });

  async function testSwapFactory(swapFactory, swapIndex) {
    const pairsLength = (await swapFactory.allPairsLength()).toNumber()
    console.log('swapFactory allPairsLength', pairsLength);

    const testPairsCount = Math.min(2, pairsLength)
    for (i=0; i<testPairsCount; i++) {
      const LP = await swapFactory.allPairs(i);
      console.log("token",i,LP);

      try {
        console.time("getPrice");
        price = await oracle.getPrice(LP);
        console.timeEnd("getPrice");
        console.log("price:", BigNumber(price).toFixed()/10**precisionDecimals);
      } catch {
        console.log("Uni", i, LP);
      }

      const swapAddress = await oracle.swaps(swapIndex); // Swap at index 1 - SushiSwap
      const swap = await SwapBase.at(swapAddress)
      const underlying = await swap.getUnderlying(LP);
      token0 = underlying[0][0].toLowerCase();
      token1 = underlying[0][1].toLowerCase();
      amount0 = BigNumber(underlying[1][0]).toFixed();
      amount1 = BigNumber(underlying[1][1]).toFixed();
      const erc0 = await ERC20.at(token0)
      const erc1 = await ERC20.at(token1)
      console.log( 'token0', await erc0.symbol(), token0, 'amount0', amount0);
      console.log( 'token1', await erc1.symbol(), token1, 'amount1', amount1);

      console.log("")
    }
  }

  it("Sushi LPs Repeatable", async function() {
    await testSwapFactory(sushiswapFactory,0)
  });

  it("Quick LPs Repeatable", async function() {
    await testSwapFactory(quickswapFactory,1)
  });

  it("Waultswap LPs Repeatable", async function() {
    await testSwapFactory(waultswapFactory,2)
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

    ethPrice = await oracle.getPrice(keyTokens['WETH'], {from: governance});
    console.log("WETH price:", BigNumber(ethPrice).toFixed()/10**precisionDecimals);
    usdcPrice = await oracle.getPrice(keyTokens['USDC'], {from: governance});
    console.log("USDC price:", BigNumber(usdcPrice).toFixed()/10**precisionDecimals);

    console.log("Change defined output to WETH");
    await oracle.changeDefinedOutput(keyTokens['WETH'], {from: governance});
    ethPrice = await oracle.getPrice(keyTokens['WETH'], {from: governance});
    console.log("WETH price:", BigNumber(ethPrice).toFixed()/10**precisionDecimals);
    usdcPrice = await oracle.getPrice(keyTokens['USDC'], {from: governance});
    console.log("USDC price:", BigNumber(usdcPrice).toFixed()/10**precisionDecimals);
  });

});
