// SPDX-License-Identifier: MIT
pragma solidity  0.6.12;

import "./interface/IStrategyV2.sol";
import "./interface/IVault.sol";
import "./interface/IRewardPool.sol";
import "./BookkeeperRegistry.sol";

contract BookkeeperCalculation {

    function getVaultSharePrice(address _vault) public view returns (uint256) {
      IVault vault = IVault(_vault);
      uint256 sharePrice = vault.getPricePerFullShare();
      return sharePrice;
    }

    function getRewardPoolRewardPerTokenStored(address _rewardPool) public view  returns (uint256) {
      IRewardPool rewardPool = IRewardPool(_rewardPool);
      uint256 rewardPerTokenStored = rewardPool.rewardPerTokenStored();
      return rewardPerTokenStored;
    }

    function getRewardPoolRewardRate(address _rewardPool) public view returns (uint256) {
      IRewardPool rewardPool = IRewardPool(_rewardPool);
      uint256 rewardRate = rewardPool.rewardRate();
      return rewardRate;
    }
}

