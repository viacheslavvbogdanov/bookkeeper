// SPDX-License-Identifier: MIT
pragma solidity  ^0.7.4;

import "./BookkeeperRegistry" as Registry;
import "./BookkeeperCalculations" as Calc;

contract Bookkeeper {

    // General Data

    function getVaults() public view return address[] {
        return Registry.getVaults();
    }

    function getPools() public view return address[] {
        return Registry.getPools();
    }

    function getStrategies() public view return address[] {
        return Registry.getStrategies();
    }

    function getCoreContracts() public view return address[] {
        return Registry.getCoreContracts();
    }


    // Pool Data

    function getPoolName(address poolAddress) public view returns string {
        return Registry.getPoolName(poolAddress);
    }

    function getRewardPerToken(address poolAddress) public view returns uint256 {
        return Calc.getRewardPerToken(poolAddress);
    }

    function getRewardRate(address poolAddress) public view returns uint256{
        return Calc.getRewardRate(poolAddress);
    }


    // Strategy Data

    function getStrategyName(address strategyAddress) public view returns string {
        return Registry.getStrategyName(strategyAddress);
    }

    function getAssociatedVaults(address strategyAddress) public view returns address[]{
        return Registry.getStrategyVaults(strategyAddress);
    }

    function getUnderlyingERC20(address strategyAddress) public view returns address {
        return Registry.getUnderlying(strategyAddress);
    }

    function getInvestedUnderlyingBalance(address strategyAddress) public view returns uint256 {
        return Calc.getInvestedUnderlyingBalance(strategyAddress);
    }


    // Vault Data

    function getVaultName(address vaultAddress) public view returns string {
        return Registry.getVaultName(vaultAddress);
    }

    function getUnderlyingBalance(address vaultAddress) public view returns uint256 {
        return Calc.getUnderlyingBalance(vaultAddress);
    }

    function getUnderlingBalanceWithInvestment(address vaultAddress) public view returns uint256 {
        return Calc.getUnderlyingBalance(vaultAddress)
    }
}