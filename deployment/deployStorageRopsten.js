const Encryption = require('./encryptionTools.js');
const password = Buffer.from(process.env.PASSWORD, 'utf8');
const net = network.name;

async function main() {
  const ropstenPrivateKey = await Encryption.decryptDeployerKey(password, net);
  keyStr = await ropstenPrivateKey.toString();
  provider = await ethers.getDefaultProvider("ropsten");
  deployer = await new ethers.Wallet("0x" + keyStr, provider);

  console.log(
    "Deploying contracts with the account:",
    deployer.address
  );

  const Storage = await ethers.getContractFactory("Storage", deployer);
  const storage = await Storage.deploy();
  console.log("Storage address:", storage.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
