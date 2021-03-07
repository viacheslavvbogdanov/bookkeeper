const Encryption = require('./encryptionTools.js');
const password = Buffer.from(process.env.PASSWORD, 'utf8');
const deployerKey = Buffer.from(process.env.DEPLOYER_KEY);

Encryption.createPassword(password);
Encryption.encryptDeployerKey(password, deployerKey);
