const Encryption = require('./encryptionTools.js');
const password = Buffer.from(process.env.PASSWORD, 'utf8');
const deployerKey = Buffer.from(process.env.DEPLOYER_KEY);
const net = network.name;

Encryption.createPassword(password, net);
Encryption.encryptDeployerKey(password, deployerKey, net);
