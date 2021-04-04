const Encryption = require('./encryptionTools.js');
const Deployment = require('./deploymentTools.js');
const password = Buffer.from(process.env.PASSWORD, 'utf8');
const net = network.name;

async function main() {
  await Deployment.deploy(password, net, "Storage");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
