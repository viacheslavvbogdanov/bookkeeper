// SPDX-License-Identifier: MIT
pragma solidity  ^0.7.4;

import "./hardworkInterface/IStrategyV2.sol"
import "./hardworkInterface/IVault.sol"
import "./hardworkInterface/IRewardPool"
import "./BookkeeperRegistry"

contract BookkeeperCalculation {

    function getVaultSharePrice(address _vault) public view validVault(_vault) returns (uint256) {
      IVault vault = IVault(_vault);
      uint256 sharePrice = vault.getPricePerFullShare();
      return sharePrice;
    }

    function getRewardPoolRewardPerTokenStored(address _rewardPool) public view validRewardPool(_rewardPool) returns (uint256) {
      IRewardPool rewardPool = IRewardPool(_rewardPool);
      uint256 rewardPerTokenStored = rewardPool.rewardPerTokenStored();
      return rewardPerTokenStored;
    }

    function getRewardPoolRewardRate(address _rewardPool) public view validRewardPool(_rewardPool) returns (uint256) {
      IRewardPool rewardPool = IRewardPool(_rewardPool);
      uint256 rewardRate = rewardPool.rewardRate();
      return rewardRate;
    }

    function getRewardPoolInfo(address _rewardPool) public view validRewardPool(_rewardPool) returns (address,address,uint256,uint256) {
      address vault = getRewardPoolVault(_rewardPool);
      uint256 rewardRate = getRewardPoolRewardRate(_rewardPool);
      uint256 rewardPerTokenStored = getRewardPoolRewardPerTokenStored(_rewardPool);
      return (_rewardPool,vault,rewardRate,rewardPerTokenStored);
    }
}

