const Encryption = require('./encryptionTools.js');
const password = Buffer.from(process.env.PASSWORD, 'utf8');

async function main() {
  const ropstenPrivateKey = await Encryption.decryptDeployerKey(password);
  keyStr = await ropstenPrivateKey.toString();
  provider = await ethers.getDefaultProvider("ropsten");
  deployer = await new ethers.Wallet("0x" + keyStr, provider);

  console.log(
    "Deploying contracts with the account:",
    deployer.address
  );

  const OracleRopsten = await ethers.getContractFactory("OracleRopsten", deployer);
  const oracleRopsten = await OracleRopsten.deploy("0x3655C41815B08Fca78B8A79DC8b87095c76B4Ff1");
  console.log("Oracle address:", oracleRopsten.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
