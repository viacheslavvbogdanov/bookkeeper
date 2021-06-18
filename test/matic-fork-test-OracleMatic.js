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
  let sushiswapFactoryAddress = "0xc35DADB65012eC5796536bD9864eD8773aBc74C4";

  const addrUSDC = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
  let keyTokens = [
    addrUSDC, //USDC
    "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", //WETH
    "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", //DAI
    "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", //USDT
    "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6", //WBTC
  ];

  let definedOutputToken = addrUSDC; //USDC

  let sushiswapFactory;

  before(async function () {
    console.log("Setting up contract")
    accounts = await web3.eth.getAccounts();
    governance = accounts[1];
    // deploy storage
    storage = await Storage.new({ from: governance });
    // deploy Oracle
    oracle = await OracleMatic.new(storage.address, {from: governance});

    sushiswapFactory = await IUniswapV2Factory.at(sushiswapFactoryAddress);
  });
  it("Normal Tokens", async function () {

    for (i=0;i<keyTokens.length;i++) {
      console.log("Key Token",i,keyTokens[i]);
      try {
        console.time("getPrice");
        price = await oracle.getPrice(keyTokens[i]);
        console.timeEnd("getPrice");
        console.log("price:", BigNumber(price).toFixed()/10**precisionDecimals);
      } catch (error) {
        price = undefined;
        console.log("Error at Token", i, keyTokens[i], error);
      }
      console.log("");
    }

  });

  it("Sushi LPs Repeatable", async function() {
    const pairsLength = (await sushiswapFactory.allPairsLength()).toNumber()
    console.log('sushiswapFactory allPairsLength', pairsLength);

    const testPairsCount = Math.min(5, pairsLength)
    for (i=0; i<testPairsCount; i++) {
      const sushiLP = await sushiswapFactory.allPairs(i);
      console.log("Sushi token",i,sushiLP);

      try {
        console.time("getPrice");
        price = await oracle.getPrice(sushiLP);
        console.timeEnd("getPrice");
        console.log("price:", BigNumber(price).toFixed()/10**precisionDecimals);
      } catch {
        console.log("Uni", i, sushiLP);
      }

      underlying = await oracle.getUniUnderlying(sushiLP);
      token0 = underlying[0][0].toLowerCase();
      token1 = underlying[0][1].toLowerCase();
      amount0 = BigNumber(underlying[1][0]).toFixed();
      amount1 = BigNumber(underlying[1][1]).toFixed();
      console.log('token0', token0, 'amount0', amount0);
      console.log('token1', token1, 'amount1', amount1);

      console.log("")
    }
  });

  it("Control functions", async function() {
    console.log("Change factories");
    // await oracle.changeUniFactory(sushiswapFactoryAddress, {from: governance});
    await oracle.changeSushiFactory(uniswapFactoryAddress, {from: governance});
    // await oracle.changeCurveRegistry(oneInchFactoryAddress, {from: governance});
    // await oracle.changeOneInchFactory(curveRegistryAddress, {from: governance});
    console.log("Change back");
    // await oracle.changeUniFactory(uniswapFactoryAddress, {from: governance});
    await oracle.changeSushiFactory(sushiswapFactoryAddress, {from: governance});
    // await oracle.changeCurveRegistry(curveRegistryAddress, {from: governance});
    // await oracle.changeOneInchFactory(oneInchFactoryAddress, {from: governance});
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
    usdcPrice = await oracle.getPrice(addrUSDC, {from: governance});
    console.log("USDC price:", BigNumber(usdcPrice).toFixed()/10**precisionDecimals);
  });

});
