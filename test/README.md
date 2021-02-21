# Testing

Tests can be ran after installing the hardhat environment, as described in the main README.


## Oracle
To get most accurate results in comparison with CoinGecko, change the blockNumber for the hardhat network in the `hardhat.config.js` file to a recent block.

To run the Oracle test, use the command `npx hardhat test test/mainnet-fork-test-Oracle.js`.

Note that the first run of the test may take a while, as all relevant contracts will have to be loaded locally. Repeated runs will be much quicker.
