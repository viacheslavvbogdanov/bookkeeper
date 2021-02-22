// SPDX-License-Identifier: MIT
pragma solidity  0.6.12;

import "./BookkeeperRegistry.sol" as Registry;
import "./BookkeeperCalculations.sol" as Calc;

contract Bookkeeper {

    // General Data

    // function getVaults() public view returns (address[] memory) {
    //     return Registry.getVaults();
    // }

    // function getPools() public view returns (address[] memory) {
    //     return Registry.getPools();
    // }

    // function getStrategies() public view returns (address[] memory) {
    //     return Registry.getStrategies();
    // }

    // function getCoreContracts() public view returns (address[] memory) {
    //     return Registry.getCoreContracts();
    // }


    // Pool Data

    // function getPoolName(address poolAddress) public view returns (string memory) {
    //     return Registry.getPoolName(poolAddress);
    // }

    // function getRewardPerToken(address poolAddress) public view returns (uint256) {
    //     return Calc.getRewardPerToken(poolAddress);
    // }

    // function getRewardRate(address poolAddress) public view returns (uint256) {
    //     return Calc.getRewardRate(poolAddress);
    // }


    // // Strategy Data

    // function getStrategyName(address strategyAddress) public view returns (string memory) {
    //     return Registry.getStrategyName(strategyAddress);
    // }

    // function getAssociatedVaults(address strategyAddress) public view returns (address[] memory) {
    //     return Registry.getStrategyVaults(strategyAddress);
    // }

    // function getUnderlyingERC20(address strategyAddress) public view returns (address) {
    //     return Registry.getUnderlying(strategyAddress);
    // }

    // function getInvestedUnderlyingBalance(address strategyAddress) public view returns (uint256) {
    //     return Calc.getInvestedUnderlyingBalance(strategyAddress);
    // }


    // // Vault Data

    // function getVaultName(address vaultAddress) public view returns (string memory) {
    //     return Registry.getVaultName(vaultAddress);
    // }

    // function getUnderlyingBalance(address vaultAddress) public view returns (uint256) {
    //     return Calc.getUnderlyingBalance(vaultAddress);
    // }

    // function getUnderlingBalanceWithInvestment(address vaultAddress) public view returns (uint256) {
    //     return Calc.getUnderlyingBalance(vaultAddress);
    // }
}