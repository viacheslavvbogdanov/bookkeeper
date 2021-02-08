// This test is only invoked if MAINNET_FORK is set
if ( process.env.MAINNET_FORK ) {

  const Utils = require("./Utils.js");
  const MFC = require("./mainnet-fork-test-config.js");
  const { expectRevert, send, time } = require('@openzeppelin/test-helpers');
  const BigNumber = require('bignumber.js');
  const Controller = artifacts.require("Controller");
  const Vault = artifacts.require("Vault");
  const NoMintRewardPool = artifacts.require("NoMintRewardPool");
  const Storage = artifacts.require("Storage");
  const FeeRewardForwarder = artifacts.require("FeeRewardForwarder");
  const ProfitStrategy = artifacts.require("ProfitStrategy");
  const Viewer = artifacts.require("Viewer");
  const makeVault = require("./make-vault.js");

  // ERC20 interface
  const IERC20 = artifacts.require("IERC20");

  contract("Viewer test", function(accounts){
    describe(`Setup`, function (){

      // parties in the protocol
      let governance = accounts[1];

      // Core protocol contracts
      let storage;
      let viewer;

      let strategy;
      let rewardPool;
      let underlying;
      let underlyingPool;

      beforeEach(async function () {
        // deploy storage
        storage = await Storage.new({ from: governance });
        //deploy Viewer
        viewer = await Viewer.new(storage.address, {from: governance});

        //make vault and strategy
        underlying = await IERC20.at(MFC.UNISWAP_ETH_USDC_LP_ADDRESS);
        farm = await IERC20.at(MFC.FARM_ADDRESS);

        feeRewardForwarder = await FeeRewardForwarder.new(storage.address, underlying.address, MFC.UNISWAP_V2_ROUTER02_ADDRESS, { from: governance });
        // set up controller
        controller = await Controller.new(storage.address, feeRewardForwarder.address, {
          from: governance,
        });

        await storage.setController(controller.address, { from: governance });

        newVault = await makeVault(storage.address, underlying.address, 100, 100, {from: governance});
        oldStrategy = await ProfitStrategy.new(
          storage.address,
          underlying.address,
          newVault.address,
          { from: governance }
        );
        newStrategy = await ProfitStrategy.new(
          storage.address,
          underlying.address,
          newVault.address,
          { from: governance }
        );
        oldRewardPool = await NoMintRewardPool.new(
          MFC.FARM_ADDRESS,
          newVault.address,
          604800,
          governance,
          storage.address,
          "0x0000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000",
          { from: governance}
        );
        newRewardPool = await NoMintRewardPool.new(
          MFC.FARM_ADDRESS,
          newVault.address,
          604800,
          governance,
          storage.address,
          "0x0000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000",
          { from: governance}
        );

        await newVault.setStrategy(oldStrategy.address, {from: governance});

      });

      it("Test", async function () {

        await viewer.addVaultAndRewardPool(newVault.address, oldRewardPool.address, {from : governance});
        console.log("Succesfully added vault");

        await viewer.addCoreContract(viewer.address, {from: governance});

        vaultList = await viewer.getVaultList();
        console.log("Vault list:", vaultList);
        strategyList = await viewer.getStrategyList();
        console.log("Strategy list:", strategyList);
        rewardPoolList = await viewer.getRewardPoolList();
        console.log("Reward pool list:", rewardPoolList);
        coreContractList = await viewer.getCoreContractList();
        console.log("Core contract list:", coreContractList);

        await newVault.announceStrategyUpdate(newStrategy.address, {from:governance});

        await time.advanceBlock();
        await time.increase(45000);
        await time.advanceBlock();

        await newVault.setStrategy(newStrategy.address, {from:governance});
        await viewer.changeStrategy(newStrategy.address, {from: governance});

        vaultList = await viewer.getVaultList();
        console.log("Vault list:", vaultList);
        strategyList = await viewer.getStrategyList();
        console.log("Strategy list:", strategyList);
        rewardPoolList = await viewer.getRewardPoolList();
        console.log("Reward pool list:", rewardPoolList);
        coreContractList = await viewer.getCoreContractList();
        console.log("Core contract list:", coreContractList);


        await viewer.changeRewardPool(newRewardPool.address, newVault.address, {from: governance});

        vaultList = await viewer.getVaultList();
        console.log("Vault list:", vaultList);
        strategyList = await viewer.getStrategyList();
        console.log("Strategy list:", strategyList);
        rewardPoolList = await viewer.getRewardPoolList();
        console.log("Reward pool list:", rewardPoolList);
        coreContractList = await viewer.getCoreContractList();
        console.log("Core contract list:", coreContractList);


        console.log("Reading vault");
        strategy = await viewer.getVaultStrategy(newVault.address);
        console.log("Strategy:", strategy);
        rewardPool = await viewer.getVaultRewardPool(newVault.address);
        console.log("Reward pool:", rewardPool);
        underlying = await viewer.getVaultUnderlying(newVault.address);
        console.log("Underlying:", underlying);
        sharePrice = new BigNumber(await viewer.getVaultSharePrice(newVault.address));
        console.log("Share price:", sharePrice.toFixed());
        vaultInfo = await viewer.getVaultInfo(newVault.address);
        console.log("Vault info:", vaultInfo);

        console.log("Reading Strategy");
        strategyUnderlying = await viewer.getStrategyUnderlying(newStrategy.address);
        console.log("Underlying:", strategyUnderlying);
        strategyVault = await viewer.getStrategyVault(newStrategy.address);
        console.log("Vault:", strategyVault);
        strategyInfo = await viewer.getStrategyInfo(newStrategy.address);
        console.log("Strategy info:", strategyInfo);

        console.log("Reading Reward Pool");
        rewardPoolRewardPerTokenStored = await viewer.getRewardPoolRewardPerTokenStored(newRewardPool.address);
        console.log("Reward per token:", rewardPoolRewardPerTokenStored);
        rewardPoolRewardRate = await viewer.getRewardPoolRewardRate(newRewardPool.address);
        console.log("Reward rate:", rewardPoolRewardRate);
        rewardPoolVault = await viewer.getRewardPoolVault(newRewardPool.address);
        console.log("Vault:", rewardPoolVault);
        rewardPoolInfo = await viewer.getRewardPoolInfo(newRewardPool.address);
        console.log("Reward pool info:", rewardPoolInfo);

        console.log("Address checks")
        isVault0 = await viewer.isVault(newVault.address);
        isStrategy0 = await viewer.isStrategy(newVault.address);
        isRewardPool0 = await viewer.isRewardPool(newVault.address);
        isCoreContract0 = await viewer.isCoreContract(newVault.address);
        isHarvestContract0 = await viewer.isHarvestContract(newVault.address);
        console.log("Vault checks:", isVault0, isStrategy0, isRewardPool0, isCoreContract0, isHarvestContract0)

        isVault1 = await viewer.isVault(strategy);
        isStrategy1 = await viewer.isStrategy(strategy);
        isRewardPool1 = await viewer.isRewardPool(strategy);
        isCoreContract1 = await viewer.isCoreContract(strategy);
        isHarvestContract1 = await viewer.isHarvestContract(strategy);
        console.log("Strategy checks:", isVault1, isStrategy1, isRewardPool1, isCoreContract1, isHarvestContract1)

        isVault2 = await viewer.isVault(rewardPool);
        isStrategy2 = await viewer.isStrategy(rewardPool);
        isRewardPool2 = await viewer.isRewardPool(rewardPool);
        isCoreContract2 = await viewer.isCoreContract(rewardPool);
        isHarvestContract2 = await viewer.isHarvestContract(rewardPool);
        console.log("Reward pool checks:", isVault2, isStrategy2, isRewardPool2, isCoreContract2, isHarvestContract2)

        console.log("Test removals")

        await viewer.removeStrategy(newStrategy.address, {from : governance});
        vaultList = await viewer.getVaultList();
        console.log("Vault list:", vaultList);
        strategyList = await viewer.getStrategyList();
        console.log("Strategy list:", strategyList);
        rewardPoolList = await viewer.getRewardPoolList();
        console.log("Reward pool list:", rewardPoolList);
        coreContractList = await viewer.getCoreContractList();
        console.log("Core contract list:", coreContractList);

        await viewer.removeCoreContract(viewer.address, {from : governance});
        vaultList = await viewer.getVaultList();
        console.log("Vault list:", vaultList);
        strategyList = await viewer.getStrategyList();
        console.log("Strategy list:", strategyList);
        rewardPoolList = await viewer.getRewardPoolList();
        console.log("Reward pool list:", rewardPoolList);
        coreContractList = await viewer.getCoreContractList();
        console.log("Core contract list:", coreContractList);

        await viewer.removeRewardPool(newRewardPool.address, {from : governance});
        vaultList = await viewer.getVaultList();
        console.log("Vault list:", vaultList);
        strategyList = await viewer.getStrategyList();
        console.log("Strategy list:", strategyList);
        rewardPoolList = await viewer.getRewardPoolList();
        console.log("Reward pool list:", rewardPoolList);
        coreContractList = await viewer.getCoreContractList();
        console.log("Core contract list:", coreContractList);

        await viewer.removeVault(newVault.address, {from : governance});
        vaultList = await viewer.getVaultList();
        console.log("Vault list:", vaultList);
        strategyList = await viewer.getStrategyList();
        console.log("Strategy list:", strategyList);
        rewardPoolList = await viewer.getRewardPoolList();
        console.log("Reward pool list:", rewardPoolList);
        coreContractList = await viewer.getCoreContractList();
        console.log("Core contract list:", coreContractList);

      });
    });
  });
};
