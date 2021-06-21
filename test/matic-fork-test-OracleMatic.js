// Utilities
// noinspection JSUndeclaredVariable

const Utils = require("./utilities/Utils.js");
const MFC = require("./mainnet-fork-test-config.js");
const CoinGecko = require("coingecko-api");
const CoinGeckoClient = new CoinGecko();

const { send } = require("@openzeppelin/test-helpers");
const BigNumber = require("bignumber.js");
const IERC20 = artifacts.require("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20");
const ERC20 = artifacts.require("ERC20")
const IUniswapV2Factory = artifacts.require("IUniswapV2Factory");

const Storage = artifacts.require("Storage");
const OracleMatic = artifacts.require("OracleMatic");

// Vanilla Mocha test. Increased compatibility with tools that integrate Mocha.
describe("Testing all functionality", function () {

  function sum(total, num) {
    return BigNumber.sum(total, num);
  }

  let accounts;
  let precisionDecimals = 18;
  // parties in the protocol

  // Core protocol contracts
  let storage;
  let oracle;

  let quickswapFactoryAddress = "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32";
  let sushiswapFactoryAddress = "0xc35DADB65012eC5796536bD9864eD8773aBc74C4";

  let keyTokens = {
    'USDC': "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    'WETH': "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    'DAI' : "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    'USDT': "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    'WBTC': "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
  };

  let definedOutputToken = keyTokens['USDC'];

  let sushiswapFactory, quickswapFactory;

  before(async function () {
    console.log("Setting up contract")
    accounts = await web3.eth.getAccounts();
    governance = accounts[1];
    // deploy storage
    storage = await Storage.new({ from: governance });
    // deploy Oracle
    oracle = await OracleMatic.new(storage.address, {from: governance});

    sushiswapFactory = await IUniswapV2Factory.at(sushiswapFactoryAddress);
    quickswapFactory = await IUniswapV2Factory.at(quickswapFactoryAddress);
  });

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

  async function testSwapFactory(swapFactory) {
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

      underlying = await oracle.getUniUnderlying(LP);
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
    await testSwapFactory(sushiswapFactory)
  });

  it("Quick LPs Repeatable", async function() {
    await testSwapFactory(quickswapFactory)
  });

  it("Control functions", async function() {
    console.log("Change factories");
    await oracle.changeSushiFactory(quickswapFactoryAddress, {from: governance});
    console.log("Change back");
    await oracle.changeSushiFactory(sushiswapFactoryAddress, {from: governance});
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
