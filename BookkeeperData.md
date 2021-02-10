# Bookkeeper Data

This document will define the public interface of Bookkeeper. This will evolve over time.

## General

* getVaults()
  * returns all vaults as array of (address, name)
* getPools()
  * returns all pools as array of (address, nama)
* getStrategies()
  * returns all strategies as array of (address, name)
* getCoreContracts()
  * returns list of all core contracts as array of (address, name)

## Pool Data

* getPoolName(address)
  * returns name of pool as string
* getFarmPerToken(address)
  * returns the FARM recieved per staked fToken as uint256
* getFarmRewardRate(address)
  * retunrs the FARM reward rate as uint256

## Strategy Data

* getStrategyName(address)
  * returns name of strategy as string
* getInvestedUnderlyingBalance(address)
  * returns the underlying balance that is invested via this strategy as uint256
* getVault(address)
  * returns the vault address associated with a strategy
* getUnderlying(address)
  * returns the address of the underlying ERC20 used by the strategy

## Vault Data

* getVaultName(address)
  * returns name of vault as string
* getUnderlyingBalance(address)
  * retunrs the underlying balance in the vault
* getUnderlyingBalanceWithInvestment(address)
  * returns the underlying balance in the vault, including that which is invested by the strategy or strategies
