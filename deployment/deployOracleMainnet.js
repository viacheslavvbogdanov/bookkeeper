const Encryption = require('./encryptionTools.js');
const password = Buffer.from(process.env.PASSWORD, 'utf8');
const storage = process.env.STORAGE_ADDRESS.trim();
const net = network.name;

async function main() {
  const deployerKey = await Encryption.decryptDeployerKey(password, net);
  deployerKeyStr = await deployerKey.toString();
  provider = await ethers.getDefaultProvider("mainnet");
  deployer = await new ethers.Wallet("0x" + deployerKeyStr, provider);

  console.log(
    "Deploying contracts with the account:",
    deployer.address
  );

  const OracleMainnet = await ethers.getContractFactory("OracleMainnet");
  const oracleMainnet = await OracleMainnet.deploy( storage );
  console.log("Contract address:", oracleMainnet.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
