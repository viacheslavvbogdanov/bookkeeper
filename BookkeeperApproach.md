# Harvest Bookkeeper (View SC)

Formerly called the View SC -- because it is sort of like a database view. I am proposing that we call it __Bookkeeper__ because that is it's job function in spirit. It also keeps with the Harvest ethos of having a job and doing work. All farms need a Bookkeeper.

## Goal of Bookkeeper

Provide a contract that presents all relevant data from active vaults and strategies as `view` or `pure` functions so they do not cost any gas to interact with. This allows us to easily integrate them with **The Graph**.

What is relevant data? Basically any informational `view` function that might be useful.

* Vaults
  * underlyingBalanceInVault
  * underlyingBalanceWithInvestment
  * getPricePerFullShare
  * totalSupply (ERC20)
  * strategy
  * underlying
  * vaultFractionToInvestNumerator
  * vaultFractionToInvestDenominator
* Strategies
  * investedUnderlyingBalance
  * governance
  * controller
  * underlying
  * vault
* NoMintRewardPool/AutoStake
  * lastTimeRewardApplicable
  * rewardPerToken

I am not sure how useful some of the non-economic data will be (governance, controller), but I will leave that up to those who know the platform and code better.

## Bookkeeper Implementation Thoughts

The Bookkeeper should be mostly `view` functions. This will allow the functions to be called from **The Graph** without incurring any real gas cost. The exception here would be for updating relevant calculation groups or other Bookkeeper management type stuff.

Contract addresses for Vault, Strategies, and RewardPools should be stored as `address constant public` so they can be used in the Bookkeeper's functions. This creates a secondary benefit for the Bookkeeper as an on-chain registry of Harvest contract addresses.

The Bookkeeper should include functions for retrieving data from individual contracts (based on the vault/strategy interfaces) but it could (maybe should) include aggregate functions based on groupings -- only stablecoin vaults, just BTC strategies... not really sure what these could be, maybe core devs have some ideas. Maybe these arrays could be updated via an `addAddressToGroup(groupId, address)` function?

## Integration with The Graph

### Subgraph manifest

The [subgraph manifest](https://thegraph.com/docs/define-a-subgraph) defines the smart contract details we want to index

A subgraph appears to be able to support three types of `handlers` that can be configured in the mapping:

* [eventHandlers](https://thegraph.com/docs/define-a-subgraph#the-subgraph-manifest)
  * Watches for specified contract events and invokes provided handler
* [callHandlers](https://thegraph.com/docs/define-a-subgraph#call-handlers)
  * Watches for specified contract call and invokes provided handler
* [blockHandlers](https://thegraph.com/docs/define-a-subgraph#block-handlers)
  * Invokes a handler on all (or some filtered set of) blocks

I suspect we could use all three event types depending on what type of data we want the Bookkeeper to provide. This will probably require some discussion with the core devs.

### GraphQL Schema

The [GraphQL schema](https://thegraph.com/docs/define-a-subgraph#the-graphql-schema) will define the data that we are providing in our subgraph. The schema will be based on the data we can provide via the Bookkeeper. I have done this before and the schema itself is not hard, but there may be some data modeling challenges here.

### Mapping

The [mapping](https://thegraph.com/docs/define-a-subgraph#writing-mappings) is where we implement the handlers that are defined in the Bookkeeper. It is written in AssemblyScript, which is similar to TypeScript but compiles to WASM. This is where we wold be directly interacting with the Bookkeeper -- likely in blockHandlers for collecting periodic data.

### Harvest Event notes

While trying to catalog the `view` functions I also made note of the events that we could use as part of a subgraph `eventHandler`:

* Vaults
  * Withdraw
  * Deposit
  * Invest
  * StrategyAnnounced
  * StrategyChanged
* Strategies
  * ProfitLogInReward
  * ProgitsNotCollected
  * Liquidating
* NoMintRewardPool/AutoStake
  * RewardAdded
  * Staked
  * Withdrawn
  * RewardPaid
  * RewardDenied
  * SmartContractRecorded
  * Migrated
  * Staked
  * StakingDenied
  * Withdrawn
  * SmartContractDenied
  * ForceGreylistExited
  * SmartContractRecorded

## Design Guidelines and Requirements

### General

* Split functionality between files. We don't want one huge file that represents the entire contract.
* Main contract should have an owner who manages info and relations
  * Owner should be able to add and remove info and relations
* Underlying tokens should have a link to LP where we can buy/sell
  * like uni/sushi/curve
* All functionality should be unit tested

### Relationship/Information Details

* startOnBlock - is this the date that a strategy started? TODO: ask belbix

### Contract Metadata

* createdOnBlock should be stored for all contracts (accessible via Registry?)
