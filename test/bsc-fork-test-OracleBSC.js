// Utilities
const MFC = require("./config/mainnet-fork-test-config.js");
const { artifacts, web3 } = require("hardhat");

const { send } = require("@openzeppelin/test-helpers");
const BigNumber = require("bignumber.js");
const IPancakeFactory = artifacts.require("IPancakeFactory");
const IMooniFactory = artifacts.require("IMooniFactory")

//const Strategy = artifacts.require("");
const Storage = artifacts.require("Storage");
const OracleBSC = artifacts.require("OracleBSC");
const OracleBSC_old = artifacts.require("OracleBSC_old");

const assert = require('assert');

// Vanilla Mocha test. Increased compatibility with tools that integrate Mocha.
describe("BSC: Testing all functionality", function (){
  
  let accounts;
  let precisionDecimals = 18;
  // parties in the protocol

  // Core protocol contracts
  let storage;
  let oracle;

  let pancakeFactoryAddress = "0xBCfCcbde45cE874adCB698cC183deBcF17952812";
  let oneInchFactoryAddress = "0xD41B24bbA51fAc0E4827b6F94C0D6DDeB183cD64";

  let normalTokens = ["0x4b5c23cac08a567ecf0c1ffca8372a45a5d33743", "0xf952fc3ca7325cc27d15885d37117676d25bfda6", "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82", "0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63",
                  "0x0d9319565be7f53cefe84ad201be3f40feae2740", "0xfce146bf3146100cfe5db4129cf6c82b0ef4ad8c", "0x111111111117dc0aa78b770fa6a738034120c302"];
  let pancakeLPs = ["0xA527a61703D82139F8a06Bc30097cC9CAA2df5A6","0x1B96B92314C44b159149f7E0303511fB2Fc4774f","0x7561EEe90e24F3b348E1087A005F78B4c8453524","0x70D8929d04b60Af4fb9B58713eBcf18765aDE422",
                "0xc15fa3E22c912A276550F3E5FE3b0Deb87B55aCd","0x99d865Ed50D2C32c1493896810FA386c1Ce81D91","0x20bCC3b8a0091dDac2d0BC30F68E6CBb97de59Cd","0xfF17ff314925Dff772b71AbdFF2782bC913B3575",
                "0x7Bb89460599Dbf32ee3Aa50798BBcEae2A5F7f6a","0xbCD62661A6b1DEd703585d3aF7d7649Ef4dcDB5c"];
  let oneInchLPs = ["0xdaF66c0B7e8E2FC76B15B07AD25eE58E04a66796","0xc33876129A6AC1022d316Ac824f8eab58C7d303B", "0xe3f6509818ccf031370bB4cb398EB37C21622ac4"];

  let keyTokens = [
    "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", //USDC
    "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", //ETH
    "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", //DAI
    "0x55d398326f99059fF775485246999027B3197955", //USDT
    "0x23396cF899Ca06c4472205fC903bDB4de249D6fC", //UST
    "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", //BTCB
    "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", //BUSD
    "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", //WBNB
    "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7" //VAI
  ];
  // let pricingTokens = [
  //   "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", //WBNB
  //   "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", //BUSD
  //   "0x55d398326f99059fF775485246999027B3197955", //USDT
  //   "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", //USDC
  //   "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7", //VAI
  //   "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3" //DAI
  // ];
  // let definedOutputToken = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"; //BUSD
  let governance;
  let pancakeFactory, oneInchFactory;
  
  before(async function () {
    console.log("Setting up contract")
    accounts = await web3.eth.getAccounts();
    governance = accounts[1];
    // deploy storage
    storage = await Storage.new({ from: governance });
    //deploy Oracle
    oracle = await OracleBSC.new(storage.address, {from: governance});

    pancakeFactory = await IPancakeFactory.at(pancakeFactoryAddress);
    oneInchFactory = await IMooniFactory.at(oneInchFactoryAddress);
  });

  it.only("Production Tokens", async function () { //TODO remove .only
    const tokens = require("./config/production-tokens-bsc.js");
    // const oldOracle = await OracleMainnet_old.at('0x48dc32eca58106f06b41de514f29780ffa59c279')
    const oldOracle = await OracleBSC_old.new(storage.address, {from: governance})
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
        // assert(equal, 'New oracle price must be equal old oracle price')
      } catch(e) {
        console.log('Exception:', e);
        //TODO at production-tokens.js we have few addresses that treated as non-contract accounts
      }
      console.log('');
    }

  })

  it("Normal Tokens", async function () {
    const checkTokens = [
      "0xfce146bf3146100cfe5db4129cf6c82b0ef4ad8c"
    ];

    for (let i=0;i<checkTokens.length;i++) {
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
      console.log("");
    }

    for (let i=0;i<keyTokens.length;i++) {
      console.log("Key Token",i,keyTokens[i]);
      try {
        console.time("getPrice");
        const price = await oracle.getPrice(keyTokens[i]);
        console.timeEnd("getPrice");
        console.log("price:", BigNumber(price).toFixed()/10**precisionDecimals);
      } catch (error) {
        console.log("Error at Token", i, keyTokens[i]);
      }
      console.log("");
    }

    for (let i=0;i<normalTokens.length;i++) {
      console.log("Token",i,normalTokens[i]);
      try {
        console.time("getPrice");
        const price = await oracle.getPrice(normalTokens[i]);
        console.timeEnd("getPrice");
        console.log("price:", BigNumber(price).toFixed()/10**precisionDecimals);
      } catch (error) {
        console.log("Error at Token", i, normalTokens[i]);
      }
      console.log("");
    }
  });

  it("Pancake LPs Repeatable", async function() {
    for (let i=0;i<pancakeLPs.length;i++) {
      console.log("Pancake token",i,pancakeLPs[i]);
      try {
        console.time("getPrice");
        const price = await oracle.getPrice(pancakeLPs[i]);
        console.timeEnd("getPrice");
        console.log("price:", BigNumber(price).toFixed()/10**precisionDecimals);
      } catch {
        console.log("Error at Pancake", i, pancakeLPs[i]);
      }
      console.log("")
    }
  });

  it("1Inch LPs Repeatable", async function() {
    for (let i=0;i<oneInchLPs.length;i++) {
      console.log("OneInch token",i,oneInchLPs[i]);
      try {
        console.time("getPrice");
        price = await oracle.getPrice(oneInchLPs[i]);
        console.timeEnd("getPrice");
        console.log("price:", BigNumber(price).toFixed()/10**precisionDecimals);
      } catch {
        console.log("Error at 1INCH", i, oneInchLPs[i]);
      }
      console.log("")
    }
  });

  it("Control functions", async function() {
    console.log("Change factories");
    await oracle.changePancakeFactory(oneInchFactoryAddress, {from: governance});
    await oracle.changeOneInchFactory(pancakeFactoryAddress, {from: governance});
    console.log("Change back");
    await oracle.changePancakeFactory(pancakeFactoryAddress, {from: governance});
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
    console.log("Change defined output to WBNB");
    await oracle.changeDefinedOutput("0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", {from: governance});
    bnbPrice = await oracle.getPrice("0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", {from: governance});
    console.log("WBNB price:", BigNumber(bnbPrice).toFixed()/10**precisionDecimals);
    busdPrice = await oracle.getPrice("0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", {from: governance});
    console.log("BUSD price:", BigNumber(busdPrice).toFixed()/10**precisionDecimals);
  });

});
