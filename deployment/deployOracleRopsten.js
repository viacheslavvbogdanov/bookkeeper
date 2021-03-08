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

  const OracleRopsten = await ethers.getContractFactory("OracleRopsten", deployer);
  const oracleRopsten = await OracleRopsten.deploy("0x01081d9fA569190Bb40f8b8280ea18923037f9fC");
  console.log("Oracle address:", oracleRopsten.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
