const Encryption = require('./encryptionTools.js');
const password = Buffer.from(process.env.PASSWORD, 'utf8');

async function main() {
  const deployerKey = await Encryption.decryptDeployerKey(password);
  deployerKeyStr = await deployerKey.toString();
  provider = await ethers.getDefaultProvider("mainnet");
  deployer = await new ethers.Wallet("0x" + deployerKeyStr, provider);

  console.log(
    "Deploying contracts with the account:",
    deployer.address
  );

  const Storage = await ethers.getContractFactory("Storage");
  const storage = await Storage.deploy();
  console.log("Storage address:", storage.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
