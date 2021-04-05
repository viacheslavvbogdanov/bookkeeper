const Encryption = require('./encryptionTools.js');

async function deploy(password, net, contractName, ...args) {
  const privateKey = await Encryption.decryptDeployerKey(password, net);
  keyStr = await privateKey.toString();
  provider = await new ethers.providers.JsonRpcProvider(network.config.url);
  deployer = await new ethers.Wallet("0x" + keyStr, provider);

  console.log(
      "Deploying contract",
      contractName,
      "on the net",
      net,
      "with the account:",
      deployer.address
  );

  const Contract = await ethers.getContractFactory(contractName, deployer);
  const contract = await Contract.deploy(...args);
  console.log("Deployed on address:", contract.address);
};

module.exports = {
  deploy,
};
