const {getNetworkOrForkName} = require('../deploy-tools/deploy-tools')
const fetch = require('node-fetch');

module.exports = async ({getNamedAccounts, deployments, network}) => {

    console.log('+ Updating Contract Registry ');
    async function getSwapAddress(swapName) {
        const contract = await deployments.get(swapName);
        return contract.address;
    }

    const poolsUrl  = 'https://ethparser-api.herokuapp.com/contracts/pools?network='
    const vaultsUrl = 'https://ethparser-api.herokuapp.com/contracts/vaults?network='

    async function downloadAddresses(url) {
        const response = await fetch(url)
        const json = await response.json();
        const a = [];
        json.data.forEach(i => a.push(i.contract.address));
        console.log(a.length, 'addresses downloaded from', url);

        return a;
    }

    let apiPools, apiVaults, net;

    const fork = getNetworkOrForkName(network);
    switch (fork) {
        case '':  // for testing with no fork (hardhat network)
        case 'mainnet':
            net = 'eth'
            apiPools  = await downloadAddresses(poolsUrl +net);
            apiVaults = await downloadAddresses(vaultsUrl+net);
            break

        case 'bsc':
            net = 'bsc'
            apiPools  = await downloadAddresses(poolsUrl +net);
            apiVaults = await downloadAddresses(vaultsUrl+net);
            break

        case 'matic':
            apiPools  = [
                '0x284D7200a0Dabb05ee6De698da10d00df164f61d', // quick_IFARM_QUICK
                '0xE1f9A3EE001a2EcC906E8de637DBf20BB2d44633', // quick_ETH_USDT
                '0xB25e2C1efDD4b79CD5d63C0F5a45326FA4CA2139', // sushi_USDC_ETH
            ]
            apiVaults = [
                '0x388Aaf7a534E96Ea97beCAb9Ff0914BB10EC18fE', // quick_IFARM_QUICK
                '0x3D5B0a8CD80e2A87953525fC136c33112E4b885a', // quick_ETH_USDT
                '0xf76a0C5083b895c76ecBF30121F036849137D545', // sushi_USDC_ETH
            ]
            break

        default:
            console.log('- ERROR: UNKNOWN NETWORK / FORK:', fork);
            return
    }

    const {execute} = deployments;
    const {deployer} = await getNamedAccounts();
    const contractName = 'ContractRegistry';
    const options = {from: deployer}

    await execute(contractName, options, 'addPoolsArray',  apiPools);
    console.log('addPoolsArray - executed');

    await execute(contractName, options, 'addVaultsArray', apiVaults);
    console.log('addVaultsArray - executed');

};
module.exports.tags = ['RegistryUpdate'];
module.exports.dependencies = ['Registry'];
