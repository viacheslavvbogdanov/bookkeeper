// This test is only invoked if MAINNET_FORK is set
if ( process.env.MAINNET_FORK ) {

  const Utils = require("./Utils.js");
  const MFC = require("./config/mainnet-fork-test-config.js");
  const { expectRevert, send, time } = require('@openzeppelin/test-helpers');
  const BigNumber = require('bignumber.js');
  const Controller = artifacts.require("Controller");
  const Vault = artifacts.require("Vault");
  const NoMintRewardPool = artifacts.require("NoMintRewardPool");
  const Storage = artifacts.require("Storage");
  const FeeRewardForwarder = artifacts.require("FeeRewardForwarder");
  const ProfitStrategy = artifacts.require("ProfitStrategy");
  const BookkeeperRegistry = artifacts.require("BookkeeperRegistry");
  const makeVault = require("./make-vault.js");

  // ERC20 interface
  const IERC20 = artifacts.require("IERC20");

  contract("Bookkeeper Registry test", function(accounts){
    describe("Testing all functionality", function (){

      // parties in the protocol
      let governance = accounts[1];

      // Core protocol contracts
      let storage;
      let feeRewardForwarder;
      let controller;
      let bookkeeperRegistry;

      let strategy;
      let rewardPool;
      let underlying;
      let farm;
      let newVault;
      let oldStrategy;
      let newStrategy;
      let oldRewardPool;
      let newRewardPool;

      beforeEach(async function () {
        console.log("Setting up Harvest Finance contracts")
        // deploy storage
        storage = await Storage.new({ from: governance });
        //deploy Viewer
        bookkeeperRegistry = await BookkeeperRegistry.new(storage.address, {from: governance});

      });

      //Testing functionality by adding 2 vaults, changing strategies and reward pools, 
      //removing strategy, reward pool and vault.
      it("Single strategy per vault, single vault per underlying", async function () {

        //make vault and strategy
        console.log("Creating vaults/strategies/reward pools")
        underlying1 = await IERC20.at(MFC.USDC_ADDRESS);
        underlying2 = await IERC20.at(MFC.DAI_ADDRESS);

        vault1 = await makeVault(storage.address, underlying1.address, 100, 100, {from: governance});
        oldStrategy1 = await ProfitStrategy.new(
          storage.address,
          underlying1.address,
          vault1.address,
          { from: governance }
        );
        newStrategy1 = await ProfitStrategy.new(
          storage.address,
          underlying1.address,
          vault1.address,
          { from: governance }
        );
        oldRewardPool1 = await NoMintRewardPool.new(
          MFC.FARM_ADDRESS,
          vault1.address,
          604800,
          governance,
          storage.address,
          "0x0000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000",
          { from: governance}
        );
        newRewardPool1 = await NoMintRewardPool.new(
          MFC.FARM_ADDRESS,
          vault1.address,
          604800,
          governance,
          storage.address,
          "0x0000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000",
          { from: governance}
        );

        vault2 = await makeVault(storage.address, underlying2.address, 100, 100, {from: governance});
        oldStrategy2 = await ProfitStrategy.new(
          storage.address,
          underlying2.address,
          vault2.address,
          { from: governance }
        );
        newStrategy2 = await ProfitStrategy.new(
          storage.address,
          underlying2.address,
          vault2.address,
          { from: governance }
        );
        oldRewardPool2 = await NoMintRewardPool.new(
          MFC.FARM_ADDRESS,
          vault2.address,
          604800,
          governance,
          storage.address,
          "0x0000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000",
          { from: governance}
        );
        newRewardPool2 = await NoMintRewardPool.new(
          MFC.FARM_ADDRESS,
          vault2.address,
          604800,
          governance,
          storage.address,
          "0x0000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000",
          { from: governance}
        );

        await vault1.setStrategy(oldStrategy1.address, {from: governance});
        await vault2.setStrategy(oldStrategy2.address, {from: governance});

        await bookkeeperRegistry.addVault(vault1.address, oldRewardPool1.address, false, {from : governance});
        vaultRewardPool = await bookkeeperRegistry.vaultRewardPool(vault1.address);
        vaultStrategy = await bookkeeperRegistry.vaultStrategy(vault1.address);
        vaultUnderlying = await bookkeeperRegistry.vaultUnderlying(vault1.address);

        assert.equal(vaultRewardPool,oldRewardPool1.address, "Wrong reward pool");
        assert.equal(vaultStrategy,oldStrategy1.address, "Wrong strategy");
        assert.equal(vaultUnderlying,underlying1.address, "Wrong underlying");

        console.log("Added vault 1");

        await bookkeeperRegistry.addVault(vault2.address, oldRewardPool2.address, false, {from : governance});
        vaultRewardPool = await bookkeeperRegistry.vaultRewardPool(vault2.address);
        vaultStrategy = await bookkeeperRegistry.vaultStrategy(vault2.address);
        vaultUnderlying = await bookkeeperRegistry.vaultUnderlying(vault2.address);

        assert.equal(vaultRewardPool,oldRewardPool2.address, "Wrong reward pool");
        assert.equal(vaultStrategy,oldStrategy2.address, "Wrong strategy");
        assert.equal(vaultUnderlying,underlying2.address, "Wrong underlying");

        console.log("Added vault 2");

        vault1Info = await bookkeeperRegistry.getVaultInfo(vault1.address);
        strategy1Info = await bookkeeperRegistry.getStrategyInfo(oldStrategy1.address);
        rewardPool1Info = await bookkeeperRegistry.getRewardPoolInfo(oldRewardPool1.address);
        underlying1Info = await bookkeeperRegistry.getUnderlyingInfo(underlying1.address);
        console.log("")
        console.log("Vault1:", vault1.address);
        console.log("Vault added:", new BigNumber(vault1Info[0]).toFixed());
        console.log("Strategy:", vault1Info[1][0]);
        console.log("Strategy added:", new BigNumber(vault1Info[2][0]).toFixed());
        console.log("Reward pool:", vault1Info[3]);
        console.log("Reward pool added:", new BigNumber(vault1Info[4]).toFixed());
        console.log("Underlying:", vault1Info[5]);

        Utils.assertBNEq(vault1Info[0],strategy1Info[2], "Vault added mismatch vault/strategy");
        Utils.assertBNEq(vault1Info[0],rewardPool1Info[2], "Vault added mismatch vault/reward pool");
        Utils.assertBNEq(vault1Info[0],underlying1Info[1][0], "Vault added mismatch vault/underlying");
        assert.equal(vault1Info[1][0],rewardPool1Info[3][0], "Strategy mismatch vault/reward pool");
        Utils.assertBNEq(vault1Info[2][0],strategy1Info[0], "Strategy added mismatch vault/strategy");
        Utils.assertBNEq(vault1Info[2][0],rewardPool1Info[4][0], "Strategy added mismatch vault/reward pool");
        assert.equal(vault1Info[3],strategy1Info[3], "Reward pool mismatch vault/strategy");
        assert.equal(vault1Info[3],underlying1Info[2][0], "Reward pool mismatch vault/underlying");
        Utils.assertBNEq(vault1Info[4],strategy1Info[4], "Reward pool added mismatch vault/strategy");
        Utils.assertBNEq(vault1Info[4],rewardPool1Info[0], "Reward pool added mismatch vault/reward pool");
        Utils.assertBNEq(vault1Info[4],underlying1Info[3][0], "Reward pool added mismatch vault/underlying");
        assert.equal(vault1Info[5],strategy1Info[5], "Underlying mismatch vault/strategy");
        assert.equal(vault1Info[5],rewardPool1Info[5], "Underlying mismatch vault/reward pool");
        assert.equal(strategy1Info[1],rewardPool1Info[1], "Vault mismatch strategy/reward pool");
        assert.equal(strategy1Info[1],underlying1Info[0][0], "Vault mismatch strategy/underlying");

        vault2Info = await bookkeeperRegistry.getVaultInfo(vault2.address);
        strategy2Info = await bookkeeperRegistry.getStrategyInfo(oldStrategy2.address);
        rewardPool2Info = await bookkeeperRegistry.getRewardPoolInfo(oldRewardPool2.address);
        underlying2Info = await bookkeeperRegistry.getUnderlyingInfo(underlying2.address);
        console.log("")
        console.log("Vault2:", vault2.address);
        console.log("Vault added:", new BigNumber(vault2Info[0]).toFixed());
        console.log("Strategy:", vault2Info[1][0]);
        console.log("Strategy added:", new BigNumber(vault2Info[2][0]).toFixed());
        console.log("Reward pool:", vault2Info[3]);
        console.log("Reward pool added:", new BigNumber(vault2Info[4]).toFixed());
        console.log("Underlying:", vault2Info[5]);
        console.log("")

        Utils.assertBNEq(vault2Info[0],strategy2Info[2], "Vault added mismatch vault/strategy");
        Utils.assertBNEq(vault2Info[0],rewardPool2Info[2], "Vault added mismatch vault/reward pool");
        Utils.assertBNEq(vault2Info[0],underlying2Info[1][0], "Vault added mismatch vault/underlying");
        assert.equal(vault2Info[1][0],rewardPool2Info[3][0], "Strategy mismatch vault/reward pool");
        Utils.assertBNEq(vault2Info[2],strategy2Info[0], "Strategy added mismatch vault/strategy");
        Utils.assertBNEq(vault2Info[2][0],rewardPool2Info[4][0], "Strategy added mismatch vault/reward pool");
        assert.equal(vault2Info[3],strategy2Info[3], "Reward pool mismatch vault/strategy");
        assert.equal(vault2Info[3],underlying2Info[2][0], "Reward pool mismatch vault/underlying");
        Utils.assertBNEq(vault2Info[4],strategy2Info[4], "Reward pool added mismatch vault/strategy");
        Utils.assertBNEq(vault2Info[4],rewardPool2Info[0], "Reward pool added mismatch vault/reward pool");
        Utils.assertBNEq(vault2Info[4],underlying2Info[3][0], "Reward pool added mismatch vault/underlying");
        assert.equal(vault2Info[5],strategy2Info[5], "Underlying mismatch vault/strategy");
        assert.equal(vault2Info[5],rewardPool2Info[5], "Underlying mismatch vault/reward pool");
        assert.equal(strategy2Info[1],rewardPool2Info[1], "Vault mismatch strategy/reward pool");
        assert.equal(strategy2Info[1],underlying2Info[0][0], "Vault mismatch strategy/underlying");

        allVaults = await bookkeeperRegistry.getAllVaults();
        allStrategies = await bookkeeperRegistry.getAllStrategies();
        allRewardPools = await bookkeeperRegistry.getAllRewardPools();
        console.log("All vaults:", allVaults);
        console.log("All stratgies:", allStrategies);
        console.log("All reward pools:", allRewardPools);
        console.log("")

        assert.equal(allVaults.length,2);
        assert.equal(allStrategies.length,2);
        assert.equal(allRewardPools.length,2);

        await vault1.announceStrategyUpdate(newStrategy1.address, {from:governance});
        await vault2.announceStrategyUpdate(newStrategy2.address, {from:governance});

        await time.advanceBlock();
        await time.increase(45000);
        await time.advanceBlock();

        await vault1.setStrategy(newStrategy1.address, {from: governance});
        await vault2.setStrategy(newStrategy2.address, {from: governance});

        await bookkeeperRegistry.changeStrategy(newStrategy1.address, {from: governance});
        await bookkeeperRegistry.changeStrategy(newStrategy2.address, {from: governance});

        console.log("Changed strategies");

        await bookkeeperRegistry.changeRewardPool(newRewardPool1.address, {from: governance});
        await bookkeeperRegistry.changeRewardPool(newRewardPool2.address, {from: governance});

        console.log("Changed reward pools");

        vault1Info = await bookkeeperRegistry.getVaultInfo(vault1.address);
        strategy1Info = await bookkeeperRegistry.getStrategyInfo(newStrategy1.address);
        rewardPool1Info = await bookkeeperRegistry.getRewardPoolInfo(newRewardPool1.address);
        underlying1Info = await bookkeeperRegistry.getUnderlyingInfo(underlying1.address);
        console.log("")
        console.log("Vault1:", vault1.address);
        console.log("Vault added:", new BigNumber(vault1Info[0]).toFixed());
        console.log("Strategy:", vault1Info[1][0]);
        console.log("Strategy added:", new BigNumber(vault1Info[2][0]).toFixed());
        console.log("Reward pool:", vault1Info[3]);
        console.log("Reward pool added:", new BigNumber(vault1Info[4]).toFixed());
        console.log("Underlying:", vault1Info[5]);

        Utils.assertBNEq(vault1Info[0],strategy1Info[2], "Vault added mismatch vault/strategy");
        Utils.assertBNEq(vault1Info[0],rewardPool1Info[2], "Vault added mismatch vault/reward pool");
        Utils.assertBNEq(vault1Info[0],underlying1Info[1][0], "Vault added mismatch vault/underlying");
        assert.equal(vault1Info[1][0],rewardPool1Info[3][0], "Strategy mismatch vault/reward pool");
        Utils.assertBNEq(vault1Info[2][0],strategy1Info[0], "Strategy added mismatch vault/strategy");
        Utils.assertBNEq(vault1Info[2][0],rewardPool1Info[4][0], "Strategy added mismatch vault/reward pool");
        assert.equal(vault1Info[3],strategy1Info[3], "Reward pool mismatch vault/strategy");
        assert.equal(vault1Info[3],underlying1Info[2][0], "Reward pool mismatch vault/underlying");
        Utils.assertBNEq(vault1Info[4],strategy1Info[4], "Reward pool added mismatch vault/strategy");
        Utils.assertBNEq(vault1Info[4],rewardPool1Info[0], "Reward pool added mismatch vault/reward pool");
        Utils.assertBNEq(vault1Info[4],underlying1Info[3][0], "Reward pool added mismatch vault/underlying");
        assert.equal(vault1Info[5],strategy1Info[5], "Underlying mismatch vault/strategy");
        assert.equal(vault1Info[5],rewardPool1Info[5], "Underlying mismatch vault/reward pool");
        assert.equal(strategy1Info[1],rewardPool1Info[1], "Vault mismatch strategy/reward pool");
        assert.equal(strategy1Info[1],underlying1Info[0][0], "Vault mismatch strategy/underlying");

        vault2Info = await bookkeeperRegistry.getVaultInfo(vault2.address);
        strategy2Info = await bookkeeperRegistry.getStrategyInfo(newStrategy2.address);
        rewardPool2Info = await bookkeeperRegistry.getRewardPoolInfo(newRewardPool2.address);
        underlying2Info = await bookkeeperRegistry.getUnderlyingInfo(underlying2.address);
        console.log("")
        console.log("Vault2:", vault2.address);
        console.log("Vault added:", new BigNumber(vault2Info[0]).toFixed());
        console.log("Strategy:", vault2Info[1][0]);
        console.log("Strategy added:", new BigNumber(vault2Info[2][0]).toFixed());
        console.log("Reward pool:", vault2Info[3]);
        console.log("Reward pool added:", new BigNumber(vault2Info[4]).toFixed());
        console.log("Underlying:", vault2Info[5]);
        console.log("")

        Utils.assertBNEq(vault2Info[0],strategy2Info[2], "Vault added mismatch vault/strategy");
        Utils.assertBNEq(vault2Info[0],rewardPool2Info[2], "Vault added mismatch vault/reward pool");
        Utils.assertBNEq(vault2Info[0],underlying2Info[1][0], "Vault added mismatch vault/underlying");
        assert.equal(vault2Info[1][0],rewardPool2Info[3][0], "Strategy mismatch vault/reward pool");
        Utils.assertBNEq(vault2Info[2],strategy2Info[0], "Strategy added mismatch vault/strategy");
        Utils.assertBNEq(vault2Info[2][0],rewardPool2Info[4][0], "Strategy added mismatch vault/reward pool");
        assert.equal(vault2Info[3],strategy2Info[3], "Reward pool mismatch vault/strategy");
        assert.equal(vault2Info[3],underlying2Info[2][0], "Reward pool mismatch vault/underlying");
        Utils.assertBNEq(vault2Info[4],strategy2Info[4], "Reward pool added mismatch vault/strategy");
        Utils.assertBNEq(vault2Info[4],rewardPool2Info[0], "Reward pool added mismatch vault/reward pool");
        Utils.assertBNEq(vault2Info[4],underlying2Info[3][0], "Reward pool added mismatch vault/underlying");
        assert.equal(vault2Info[5],strategy2Info[5], "Underlying mismatch vault/strategy");
        assert.equal(vault2Info[5],rewardPool2Info[5], "Underlying mismatch vault/reward pool");
        assert.equal(strategy2Info[1],rewardPool2Info[1], "Vault mismatch strategy/reward pool");
        assert.equal(strategy2Info[1],underlying2Info[0][0], "Vault mismatch strategy/underlying");

        allVaults = await bookkeeperRegistry.getAllVaults();
        allStrategies = await bookkeeperRegistry.getAllStrategies();
        allRewardPools = await bookkeeperRegistry.getAllRewardPools();
        console.log("All vaults:", allVaults);
        console.log("All stratgies:", allStrategies);
        console.log("All reward pools:", allRewardPools);
        console.log("")

        assert.equal(allVaults.length,2);
        assert.equal(allStrategies.length,2);
        assert.equal(allRewardPools.length,2);

        await bookkeeperRegistry.removeRewardPool(newRewardPool1.address,{from:governance});
        console.log("Removed reward pool 1");

        await bookkeeperRegistry.removeStrategy(newStrategy2.address,{from:governance});
        console.log("Removed strategy 2");
        console.log("");

        vault1Info = await bookkeeperRegistry.getVaultInfo(vault1.address);
        strategy1Info = await bookkeeperRegistry.getStrategyInfo(newStrategy1.address);
        underlying1Info = await bookkeeperRegistry.getUnderlyingInfo(underlying1.address);
        console.log("Vault1:", vault1.address);
        console.log("Vault added:", new BigNumber(vault1Info[0]).toFixed());
        console.log("Strategy:", vault1Info[1][0]);
        console.log("Strategy added:", new BigNumber(vault1Info[2][0]).toFixed());
        console.log("Reward pool:", vault1Info[3]);
        console.log("Reward pool added:", new BigNumber(vault1Info[4]).toFixed());
        console.log("Underlying:", vault1Info[5]);
        console.log("")

        assert.equal(vault1Info[3],strategy1Info[3], "Reward pool mismatch vault/strategy");
        assert.equal(vault1Info[3],underlying1Info[2][0], "Reward pool mismatch vault/underlying");
        Utils.assertBNEq(vault1Info[4],strategy1Info[4], "Reward pool added mismatch vault/strategy");
        Utils.assertBNEq(vault1Info[4],underlying1Info[3][0], "Reward pool added mismatch vault/underlying");

        vault2Info = await bookkeeperRegistry.getVaultInfo(vault2.address);
        rewardPool2Info = await bookkeeperRegistry.getRewardPoolInfo(newRewardPool2.address);
        underlying2Info = await bookkeeperRegistry.getUnderlyingInfo(underlying2.address);
        console.log("Vault2:", vault2.address);
        console.log("Vault added:", new BigNumber(vault2Info[0]).toFixed());
        console.log("Strategy:", vault2Info[1][0]);
        console.log("Strategy added:", new BigNumber(vault2Info[2][0]).toFixed());
        console.log("Reward pool:", vault2Info[3]);
        console.log("Reward pool added:", new BigNumber(vault2Info[4]).toFixed());
        console.log("Underlying:", vault2Info[5]);
        console.log("")

        assert.equal(vault2Info[1][0],rewardPool2Info[3][0], "Strategy mismatch vault/reward pool");
        Utils.assertBNEq(vault2Info[2][0],rewardPool2Info[4][0], "Strategy added mismatch vault/reward pool");

        allVaults = await bookkeeperRegistry.getAllVaults();
        allStrategies = await bookkeeperRegistry.getAllStrategies();
        allRewardPools = await bookkeeperRegistry.getAllRewardPools();
        console.log("All vaults:", allVaults);
        console.log("All stratgies:", allStrategies);
        console.log("All reward pools:", allRewardPools);
        console.log("")
        assert.equal(allVaults.length,2);
        assert.equal(allStrategies.length,1);
        assert.equal(allRewardPools.length,1);

        await bookkeeperRegistry.removeVault(vault2.address,{from:governance});
        console.log("Removed vault 2");
        console.log("");

        allVaults = await bookkeeperRegistry.getAllVaults();
        allStrategies = await bookkeeperRegistry.getAllStrategies();
        allRewardPools = await bookkeeperRegistry.getAllRewardPools();
        console.log("All vaults:", allVaults);
        console.log("All stratgies:", allStrategies);
        console.log("All reward pools:", allRewardPools);
        console.log("")
        assert.equal(allVaults.length,1);
        assert.equal(allStrategies.length,1);
        assert.equal(allRewardPools.length,0);
      });

      //Testing functionality by adding a vault, adding a strategy, removing a strategy and removing the vault.
      it("Multiple stratgies per vault, single vault per underlying", async function () {

        //make vault and strategy
        console.log("Creating vaults/strategies/reward pools")
        underlying1 = await IERC20.at(MFC.USDC_ADDRESS);

        vault1 = await makeVault(storage.address, underlying1.address, 100, 100, {from: governance});
        oldStrategy1 = await ProfitStrategy.new(
          storage.address,
          underlying1.address,
          vault1.address,
          { from: governance }
        );
        newStrategy1 = await ProfitStrategy.new(
          storage.address,
          underlying1.address,
          vault1.address,
          { from: governance }
        );
        oldRewardPool1 = await NoMintRewardPool.new(
          MFC.FARM_ADDRESS,
          vault1.address,
          604800,
          governance,
          storage.address,
          "0x0000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000",
          { from: governance}
        );

        await vault1.setStrategy(oldStrategy1.address, {from: governance});

        await bookkeeperRegistry.addVault(vault1.address, oldRewardPool1.address, true, {from : governance});
        vaultRewardPool = await bookkeeperRegistry.vaultRewardPool(vault1.address);
        vaultStrategy = await bookkeeperRegistry.vaultStrategies(vault1.address,0);
        vaultUnderlying = await bookkeeperRegistry.vaultUnderlying(vault1.address);

        assert.equal(vaultRewardPool,oldRewardPool1.address, "Wrong reward pool");
        assert.equal(vaultStrategy,oldStrategy1.address, "Wrong strategy");
        assert.equal(vaultUnderlying,underlying1.address, "Wrong underlying");

        console.log("Added vault 1");

        vault1Info = await bookkeeperRegistry.getVaultInfo(vault1.address);
        strategy1Info = await bookkeeperRegistry.getStrategyInfo(oldStrategy1.address);
        rewardPool1Info = await bookkeeperRegistry.getRewardPoolInfo(oldRewardPool1.address);
        underlying1Info = await bookkeeperRegistry.getUnderlyingInfo(underlying1.address);
        console.log("")
        console.log("Vault1:", vault1.address);
        console.log("Vault added:", new BigNumber(vault1Info[0]).toFixed());
        console.log("Strategies:", vault1Info[1]);
        console.log("Strategy added:", new BigNumber(vault1Info[2][0]).toFixed());
        console.log("Reward pool:", vault1Info[3]);
        console.log("Reward pool added:", new BigNumber(vault1Info[4]).toFixed());
        console.log("Underlying:", vault1Info[5]);

        Utils.assertBNEq(vault1Info[0],strategy1Info[2], "Vault added mismatch vault/strategy");
        Utils.assertBNEq(vault1Info[0],rewardPool1Info[2], "Vault added mismatch vault/reward pool");
        Utils.assertBNEq(vault1Info[0],underlying1Info[1][0], "Vault added mismatch vault/underlying");
        assert.equal(vault1Info[1][0],rewardPool1Info[3][0], "Strategy mismatch vault/reward pool");
        Utils.assertBNEq(vault1Info[2][0],strategy1Info[0], "Strategy added mismatch vault/strategy");
        Utils.assertBNEq(vault1Info[2][0],rewardPool1Info[4][0], "Strategy added mismatch vault/reward pool");
        assert.equal(vault1Info[3],strategy1Info[3], "Reward pool mismatch vault/strategy");
        assert.equal(vault1Info[3],underlying1Info[2][0], "Reward pool mismatch vault/underlying");
        Utils.assertBNEq(vault1Info[4],strategy1Info[4], "Reward pool added mismatch vault/strategy");
        Utils.assertBNEq(vault1Info[4],rewardPool1Info[0], "Reward pool added mismatch vault/reward pool");
        Utils.assertBNEq(vault1Info[4],underlying1Info[3][0], "Reward pool added mismatch vault/underlying");
        assert.equal(vault1Info[5],strategy1Info[5], "Underlying mismatch vault/strategy");
        assert.equal(vault1Info[5],rewardPool1Info[5], "Underlying mismatch vault/reward pool");
        assert.equal(strategy1Info[1],rewardPool1Info[1], "Vault mismatch strategy/reward pool");
        assert.equal(strategy1Info[1],underlying1Info[0][0], "Vault mismatch strategy/underlying");

        allVaults = await bookkeeperRegistry.getAllVaults();
        allStrategies = await bookkeeperRegistry.getAllStrategies();
        allRewardPools = await bookkeeperRegistry.getAllRewardPools();
        console.log("All vaults:", allVaults);
        console.log("All stratgies:", allStrategies);
        console.log("All reward pools:", allRewardPools);
        console.log("")

        assert.equal(allVaults.length,1);
        assert.equal(allStrategies.length,1);
        assert.equal(allRewardPools.length,1);

        await vault1.announceStrategyUpdate(newStrategy1.address, {from:governance});

        await time.advanceBlock();
        await time.increase(45000);
        await time.advanceBlock();

        await vault1.setStrategy(newStrategy1.address, {from: governance});

        await bookkeeperRegistry.changeStrategy(newStrategy1.address, {from: governance});
        console.log("Added strategy");

        vault1Info = await bookkeeperRegistry.getVaultInfo(vault1.address);
        strategy1Info = await bookkeeperRegistry.getStrategyInfo(newStrategy1.address);
        rewardPool1Info = await bookkeeperRegistry.getRewardPoolInfo(oldRewardPool1.address);
        underlying1Info = await bookkeeperRegistry.getUnderlyingInfo(underlying1.address);
        console.log("")
        console.log("Vault1:", vault1.address);
        console.log("Vault added:", new BigNumber(vault1Info[0]).toFixed());
        console.log("Strategies:", vault1Info[1]);
        console.log("Strategies added:", new BigNumber(vault1Info[2][0]).toFixed(), new BigNumber(vault1Info[2][1]).toFixed());
        console.log("Reward pool:", vault1Info[3]);
        console.log("Reward pool added:", new BigNumber(vault1Info[4]).toFixed());
        console.log("Underlying:", vault1Info[5]);

        Utils.assertBNEq(vault1Info[0],strategy1Info[2], "Vault added mismatch vault/strategy");
        Utils.assertBNEq(vault1Info[0],rewardPool1Info[2], "Vault added mismatch vault/reward pool");
        Utils.assertBNEq(vault1Info[0],underlying1Info[1][0], "Vault added mismatch vault/underlying");
        assert.equal(vault1Info[1][1],rewardPool1Info[3][1], "Strategy mismatch vault/reward pool");
        Utils.assertBNEq(vault1Info[2][1],strategy1Info[0], "Strategy added mismatch vault/strategy");
        Utils.assertBNEq(vault1Info[2][1],rewardPool1Info[4][1], "Strategy added mismatch vault/reward pool");
        assert.equal(vault1Info[3],strategy1Info[3], "Reward pool mismatch vault/strategy");
        assert.equal(vault1Info[3],underlying1Info[2][0], "Reward pool mismatch vault/underlying");
        Utils.assertBNEq(vault1Info[4],strategy1Info[4], "Reward pool added mismatch vault/strategy");
        Utils.assertBNEq(vault1Info[4],rewardPool1Info[0], "Reward pool added mismatch vault/reward pool");
        Utils.assertBNEq(vault1Info[4],underlying1Info[3][0], "Reward pool added mismatch vault/underlying");
        assert.equal(vault1Info[5],strategy1Info[5], "Underlying mismatch vault/strategy");
        assert.equal(vault1Info[5],rewardPool1Info[5], "Underlying mismatch vault/reward pool");
        assert.equal(strategy1Info[1],rewardPool1Info[1], "Vault mismatch strategy/reward pool");
        assert.equal(strategy1Info[1],underlying1Info[0][0], "Vault mismatch strategy/underlying");

        allVaults = await bookkeeperRegistry.getAllVaults();
        allStrategies = await bookkeeperRegistry.getAllStrategies();
        allRewardPools = await bookkeeperRegistry.getAllRewardPools();
        console.log("All vaults:", allVaults);
        console.log("All stratgies:", allStrategies);
        console.log("All reward pools:", allRewardPools);
        console.log("")
        assert.equal(allVaults.length,1);
        assert.equal(allStrategies.length,2);
        assert.equal(allRewardPools.length,1);

        await bookkeeperRegistry.removeStrategy(oldStrategy1.address,{from:governance});
        console.log("Removed first strategy");
        console.log("");

        vault1Info = await bookkeeperRegistry.getVaultInfo(vault1.address);
        underlying1Info = await bookkeeperRegistry.getUnderlyingInfo(underlying1.address);
        console.log("Vault1:", vault1.address);
        console.log("Vault added:", new BigNumber(vault1Info[0]).toFixed());
        console.log("Strategies:", vault1Info[1]);
        console.log("Strategy added:", new BigNumber(vault1Info[2][0]).toFixed());
        console.log("Reward pool:", vault1Info[3]);
        console.log("Reward pool added:", new BigNumber(vault1Info[4]).toFixed());
        console.log("Underlying:", vault1Info[5]);
        console.log("")

        allVaults = await bookkeeperRegistry.getAllVaults();
        allStrategies = await bookkeeperRegistry.getAllStrategies();
        allRewardPools = await bookkeeperRegistry.getAllRewardPools();
        console.log("All vaults:", allVaults);
        console.log("All stratgies:", allStrategies);
        console.log("All reward pools:", allRewardPools);
        console.log("")
        assert.equal(allVaults.length,1);
        assert.equal(allStrategies.length,1);
        assert.equal(allRewardPools.length,1);

        await bookkeeperRegistry.removeStrategy(newStrategy1.address,{from:governance});
        console.log("Removed second strategy");
        console.log("");

        vault1Info = await bookkeeperRegistry.getVaultInfo(vault1.address);
        underlying1Info = await bookkeeperRegistry.getUnderlyingInfo(underlying1.address);
        console.log("Vault1:", vault1.address);
        console.log("Vault added:", new BigNumber(vault1Info[0]).toFixed());
        console.log("Strategies:", vault1Info[1]);
        console.log("Strategy added:", new BigNumber(vault1Info[2][0]).toFixed());
        console.log("Reward pool:", vault1Info[3]);
        console.log("Reward pool added:", new BigNumber(vault1Info[4]).toFixed());
        console.log("Underlying:", vault1Info[5]);
        console.log("")

        allVaults = await bookkeeperRegistry.getAllVaults();
        allStrategies = await bookkeeperRegistry.getAllStrategies();
        allRewardPools = await bookkeeperRegistry.getAllRewardPools();
        console.log("All vaults:", allVaults);
        console.log("All stratgies:", allStrategies);
        console.log("All reward pools:", allRewardPools);
        console.log("")
        assert.equal(allVaults.length,1);
        assert.equal(allStrategies.length,0);
        assert.equal(allRewardPools.length,1);

        await bookkeeperRegistry.removeVault(vault1.address,{from:governance});
        console.log("Removed vault 1");
        console.log("");

        allVaults = await bookkeeperRegistry.getAllVaults();
        allStrategies = await bookkeeperRegistry.getAllStrategies();
        allRewardPools = await bookkeeperRegistry.getAllRewardPools();
        console.log("All vaults:", allVaults);
        console.log("All stratgies:", allStrategies);
        console.log("All reward pools:", allRewardPools);
        console.log("")
        assert.equal(allVaults.length,0);
        assert.equal(allStrategies.length,0);
        assert.equal(allRewardPools.length,0);
      });

      //Testing functionality by adding 2 vaults for same underlying, and removing one of the vaults.
      it("Single strategy per vault, multiple vaults per underlying", async function () {

        //make vault and strategy
        console.log("Creating vaults/strategies/reward pools")
        underlying1 = await IERC20.at(MFC.USDC_ADDRESS);

        vault1 = await makeVault(storage.address, underlying1.address, 100, 100, {from: governance});
        oldStrategy1 = await ProfitStrategy.new(
          storage.address,
          underlying1.address,
          vault1.address,
          { from: governance }
        );
        oldRewardPool1 = await NoMintRewardPool.new(
          MFC.FARM_ADDRESS,
          vault1.address,
          604800,
          governance,
          storage.address,
          "0x0000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000",
          { from: governance}
        );

        vault2 = await makeVault(storage.address, underlying1.address, 100, 100, {from: governance});
        oldStrategy2 = await ProfitStrategy.new(
          storage.address,
          underlying1.address,
          vault2.address,
          { from: governance }
        );
        oldRewardPool2 = await NoMintRewardPool.new(
          MFC.FARM_ADDRESS,
          vault2.address,
          604800,
          governance,
          storage.address,
          "0x0000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000",
          { from: governance}
        );

        await vault1.setStrategy(oldStrategy1.address, {from: governance});
        await vault2.setStrategy(oldStrategy2.address, {from: governance});

        await bookkeeperRegistry.addVault(vault1.address, oldRewardPool1.address, false, {from : governance});
        vaultRewardPool = await bookkeeperRegistry.vaultRewardPool(vault1.address);
        vaultStrategy = await bookkeeperRegistry.vaultStrategy(vault1.address);
        vaultUnderlying = await bookkeeperRegistry.vaultUnderlying(vault1.address);

        assert.equal(vaultRewardPool,oldRewardPool1.address, "Wrong reward pool");
        assert.equal(vaultStrategy,oldStrategy1.address, "Wrong strategy");
        assert.equal(vaultUnderlying,underlying1.address, "Wrong underlying");

        console.log("Added vault 1");

        vault1Info = await bookkeeperRegistry.getVaultInfo(vault1.address);
        strategy1Info = await bookkeeperRegistry.getStrategyInfo(oldStrategy1.address);
        rewardPool1Info = await bookkeeperRegistry.getRewardPoolInfo(oldRewardPool1.address);
        underlying1Info = await bookkeeperRegistry.getUnderlyingInfo(underlying1.address);
        console.log("")
        console.log("Vault1:", vault1.address);
        console.log("Vault added:", new BigNumber(vault1Info[0]).toFixed());
        console.log("Strategies:", vault1Info[1][0]);
        console.log("Strategy added:", new BigNumber(vault1Info[2][0]).toFixed());
        console.log("Reward pool:", vault1Info[3]);
        console.log("Reward pool added:", new BigNumber(vault1Info[4]).toFixed());
        console.log("Underlying:", vault1Info[5]);

        Utils.assertBNEq(vault1Info[0],strategy1Info[2], "Vault added mismatch vault/strategy");
        Utils.assertBNEq(vault1Info[0],rewardPool1Info[2], "Vault added mismatch vault/reward pool");
        Utils.assertBNEq(vault1Info[0],underlying1Info[1][0], "Vault added mismatch vault/underlying");
        assert.equal(vault1Info[1][0],rewardPool1Info[3][0], "Strategy mismatch vault/reward pool");
        Utils.assertBNEq(vault1Info[2],strategy1Info[0], "Strategy added mismatch vault/strategy");
        Utils.assertBNEq(vault1Info[2][0],rewardPool1Info[4][0], "Strategy added mismatch vault/reward pool");
        assert.equal(vault1Info[3],strategy1Info[3], "Reward pool mismatch vault/strategy");
        assert.equal(vault1Info[3],underlying1Info[2][0], "Reward pool mismatch vault/underlying");
        Utils.assertBNEq(vault1Info[4],strategy1Info[4], "Reward pool added mismatch vault/strategy");
        Utils.assertBNEq(vault1Info[4],rewardPool1Info[0], "Reward pool added mismatch vault/reward pool");
        Utils.assertBNEq(vault1Info[4],underlying1Info[3][0], "Reward pool added mismatch vault/underlying");
        assert.equal(vault1Info[5],strategy1Info[5], "Underlying mismatch vault/strategy");
        assert.equal(vault1Info[5],rewardPool1Info[5], "Underlying mismatch vault/reward pool");
        assert.equal(strategy1Info[1],rewardPool1Info[1], "Vault mismatch strategy/reward pool");
        assert.equal(strategy1Info[1],underlying1Info[0][0], "Vault mismatch strategy/underlying");

        console.log("")
        console.log("Underlying Info");
        console.log("Vaults:", underlying1Info[0]);
        console.log("Vaults added:", new BigNumber(underlying1Info[1][0]).toFixed());
        console.log("Reward pools:", underlying1Info[2]);
        console.log("Reward pools added:", new BigNumber(underlying1Info[3][0]).toFixed());
        console.log("")

        await bookkeeperRegistry.addVault(vault2.address, oldRewardPool2.address, false, {from : governance});
        vaultRewardPool = await bookkeeperRegistry.vaultRewardPool(vault2.address);
        vaultStrategy = await bookkeeperRegistry.vaultStrategy(vault2.address);
        vaultUnderlying = await bookkeeperRegistry.vaultUnderlying(vault2.address);

        assert.equal(vaultRewardPool,oldRewardPool2.address, "Wrong reward pool");
        assert.equal(vaultStrategy,oldStrategy2.address, "Wrong strategy");
        assert.equal(vaultUnderlying,underlying1.address, "Wrong underlying");

        console.log("Added vault 2");

        vault2Info = await bookkeeperRegistry.getVaultInfo(vault2.address);
        strategy2Info = await bookkeeperRegistry.getStrategyInfo(oldStrategy2.address);
        rewardPool2Info = await bookkeeperRegistry.getRewardPoolInfo(oldRewardPool2.address);
        underlying2Info = await bookkeeperRegistry.getUnderlyingInfo(underlying1.address);
        console.log("")
        console.log("Vault2:", vault2.address);
        console.log("Vault added:", new BigNumber(vault2Info[0]).toFixed());
        console.log("Strategy:", vault2Info[1][0]);
        console.log("Strategy added:", new BigNumber(vault2Info[2][0]).toFixed());
        console.log("Reward pool:", vault2Info[3]);
        console.log("Reward pool added:", new BigNumber(vault2Info[4]).toFixed());
        console.log("Underlying:", vault2Info[5]);
        console.log("")

        Utils.assertBNEq(vault2Info[0],strategy2Info[2], "Vault added mismatch vault/strategy");
        Utils.assertBNEq(vault2Info[0],rewardPool2Info[2], "Vault added mismatch vault/reward pool");
        Utils.assertBNEq(vault2Info[0],underlying2Info[1][1], "Vault added mismatch vault/underlying");
        assert.equal(vault2Info[1][0],rewardPool2Info[3][0], "Strategy mismatch vault/reward pool");
        Utils.assertBNEq(vault2Info[2],strategy2Info[0], "Strategy added mismatch vault/strategy");
        Utils.assertBNEq(vault2Info[2][0],rewardPool2Info[4][0], "Strategy added mismatch vault/reward pool");
        assert.equal(vault2Info[3],strategy2Info[3], "Reward pool mismatch vault/strategy");
        assert.equal(vault2Info[3],underlying2Info[2][1], "Reward pool mismatch vault/underlying");
        Utils.assertBNEq(vault2Info[4],strategy2Info[4], "Reward pool added mismatch vault/strategy");
        Utils.assertBNEq(vault2Info[4],rewardPool2Info[0], "Reward pool added mismatch vault/reward pool");
        Utils.assertBNEq(vault2Info[4],underlying2Info[3][1], "Reward pool added mismatch vault/underlying");
        assert.equal(vault2Info[5],strategy2Info[5], "Underlying mismatch vault/strategy");
        assert.equal(vault2Info[5],rewardPool2Info[5], "Underlying mismatch vault/reward pool");
        assert.equal(strategy2Info[1],rewardPool2Info[1], "Vault mismatch strategy/reward pool");
        assert.equal(strategy2Info[1],underlying2Info[0][1], "Vault mismatch strategy/underlying");

        allVaults = await bookkeeperRegistry.getAllVaults();
        allStrategies = await bookkeeperRegistry.getAllStrategies();
        allRewardPools = await bookkeeperRegistry.getAllRewardPools();
        console.log("All vaults:", allVaults);
        console.log("All stratgies:", allStrategies);
        console.log("All reward pools:", allRewardPools);
        console.log("")
        assert.equal(allVaults.length,2);
        assert.equal(allStrategies.length,2);
        assert.equal(allRewardPools.length,2);

        console.log("Underlying Info");
        console.log("Vaults:", underlying2Info[0]);
        console.log("Vaults added:", new BigNumber(underlying2Info[1][0]).toFixed(),new BigNumber(underlying2Info[1][1]).toFixed());
        console.log("Reward pools:", underlying2Info[2]);
        console.log("Reward pools added:", new BigNumber(underlying2Info[3][0]).toFixed(),new BigNumber(underlying2Info[3][1]).toFixed());
        console.log("")

        await bookkeeperRegistry.removeVault(vault1.address,{from:governance});
        console.log("Removed vault 1");
        console.log("");

        allVaults = await bookkeeperRegistry.getAllVaults();
        allStrategies = await bookkeeperRegistry.getAllStrategies();
        allRewardPools = await bookkeeperRegistry.getAllRewardPools();
        console.log("All vaults:", allVaults);
        console.log("All stratgies:", allStrategies);
        console.log("All reward pools:", allRewardPools);
        console.log("")
        assert.equal(allVaults.length,1);
        assert.equal(allStrategies.length,1);
        assert.equal(allRewardPools.length,1);

        vault2Info = await bookkeeperRegistry.getVaultInfo(vault2.address);
        strategy2Info = await bookkeeperRegistry.getStrategyInfo(oldStrategy2.address);
        rewardPool2Info = await bookkeeperRegistry.getRewardPoolInfo(oldRewardPool2.address);
        underlying2Info = await bookkeeperRegistry.getUnderlyingInfo(underlying1.address);

        Utils.assertBNEq(vault2Info[0],strategy2Info[2], "Vault added mismatch vault/strategy");
        Utils.assertBNEq(vault2Info[0],rewardPool2Info[2], "Vault added mismatch vault/reward pool");
        Utils.assertBNEq(vault2Info[0],underlying2Info[1][0], "Vault added mismatch vault/underlying");
        assert.equal(vault2Info[1][0],rewardPool2Info[3][0], "Strategy mismatch vault/reward pool");
        Utils.assertBNEq(vault2Info[2],strategy2Info[0], "Strategy added mismatch vault/strategy");
        Utils.assertBNEq(vault2Info[2][0],rewardPool2Info[4][0], "Strategy added mismatch vault/reward pool");
        assert.equal(vault2Info[3],strategy2Info[3], "Reward pool mismatch vault/strategy");
        assert.equal(vault2Info[3],underlying2Info[2][0], "Reward pool mismatch vault/underlying");
        Utils.assertBNEq(vault2Info[4],strategy2Info[4], "Reward pool added mismatch vault/strategy");
        Utils.assertBNEq(vault2Info[4],rewardPool2Info[0], "Reward pool added mismatch vault/reward pool");
        Utils.assertBNEq(vault2Info[4],underlying2Info[3][0], "Reward pool added mismatch vault/underlying");
        assert.equal(vault2Info[5],strategy2Info[5], "Underlying mismatch vault/strategy");
        assert.equal(vault2Info[5],rewardPool2Info[5], "Underlying mismatch vault/reward pool");
        assert.equal(strategy2Info[1],rewardPool2Info[1], "Vault mismatch strategy/reward pool");
        assert.equal(strategy2Info[1],underlying2Info[0][0], "Vault mismatch strategy/underlying");

        console.log("Underlying Info");
        console.log("Vaults:", underlying2Info[0]);
        console.log("Vaults added:", new BigNumber(underlying2Info[1][0]).toFixed());
        console.log("Reward pools:", underlying2Info[2]);
        console.log("Reward pools added:", new BigNumber(underlying2Info[3][0]).toFixed());
      });
    });
  });
};
