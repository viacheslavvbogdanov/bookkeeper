const Encryption = require('./encryptionTools.js');
const Deployment = require('./deploymentTools.js');
const password = Buffer.from(process.env.PASSWORD, 'utf8');
const storage = process.env.STORAGE_ADDRESS.trim();
const net = network.name;

async function main() {
  await Deployment.deploy(password, net, "OracleMainnet", storage);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
