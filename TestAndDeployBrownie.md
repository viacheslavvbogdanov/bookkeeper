# Python deployment & testing instructions

## Testing & Deploying with Brownie
The testing-suite is configured for use with [Ganache](https://github.com/trufflesuite/ganache-cli) on a [forked
bsc - mainnet](https://eth-brownie.readthedocs.io/en/stable/network-management.html#using-a-forked-development-network).

To run the tests:
1. [Install Brownie](https://eth-brownie.readthedocs.io/en/stable/install.html) & [Ganache-CLI](https://github.com/trufflesuite/ganache-cli), if you haven't already.

2. Sign up for [BSCSCAN](www.bscscan.com) and generate an API key. This is required for fetching source codes of the 
   mainnet contracts we will be interacting with. Store the API key in the `BSCSCAN_TOKEN` environment variable.

```bash
export BSCSCAN_TOKEN=YourApiToken
```

3. Install project dependencies.

```bash
pip install -r requirements.txt
```

4. Run the tests.

```
brownie test  test/test_stableoracle_deployed.py -s --network bsc-main-fork
```

To deploy the contract and initialize the registry:

1. Create an account and store it in brownie (you'll have to provide your private key or create a new one)

```
brownie accounts new <id>
```
Follow the instructions.

2. Change the source file, replace `YOUR ACCOUNT` with the id of the account you generated (the ID, not public or private key!!)
```
me = accounts.load('YOUR_ACCOUNT')
```

3. Run the script

```
brownie run deploy --network bsc-main
```
