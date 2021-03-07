const sodium = require('sodium').api;
const fs = require('fs/promises');

function createPassword(password) {
  let masterKey = Buffer.allocUnsafe(sodium.crypto_secretbox_KEYBYTES);
  let masterSalt = Buffer.allocUnsafe(sodium.crypto_pwhash_SALTBYTES);

  sodium.randombytes(masterKey);
  sodium.randombytes(masterSalt);

  console.log("Encrypting password");
  derivedBytes = sodium.crypto_pwhash(sodium.crypto_secretbox_KEYBYTES+sodium.crypto_secretbox_NONCEBYTES, password, masterSalt, 10, 512000000, 2);
  derivedKey = derivedBytes.slice(0,sodium.crypto_secretbox_KEYBYTES);
  derivedNonce = derivedBytes.slice(sodium.crypto_secretbox_KEYBYTES,derivedBytes.length);
  console.log("Done");

  publicEncryptedMasterKey = sodium.crypto_secretbox(masterKey, derivedNonce, derivedKey);

  fs.writeFile('publicEncryptedMasterKey.bin', masterSalt, function(err) {
    if (err) throw err;
  });
  fs.appendFile('publicEncryptedMasterKey.bin', publicEncryptedMasterKey, function(err) {
    if (err) throw err;
  });
  console.log("Encrypted password file saved");
}

async function readMasterKeyFile() {
  masterKeyFile = await fs.readFile('publicEncryptedMasterKey.bin');
  return masterKeyFile;
};

async function readDeployerKeyFile() {
  deployerKeyFile = await fs.readFile('publicEncryptedDeployerKey.bin');
  return deployerKeyFile;
};

async function getMasterKey(password) {
  masterKeyFile = await readMasterKeyFile();
  masterSalt = await masterKeyFile.slice(0, sodium.crypto_pwhash_SALTBYTES);
  publicEncryptedMasterKey = await masterKeyFile.slice(sodium.crypto_pwhash_SALTBYTES, masterKeyFile.length);

  console.log("Checking password");
  derivedBytes = await sodium.crypto_pwhash(sodium.crypto_secretbox_KEYBYTES+sodium.crypto_secretbox_NONCEBYTES, password, masterSalt, 10, 512000000, 2);
  derivedKey = await derivedBytes.slice(0,sodium.crypto_secretbox_KEYBYTES);
  derivedNonce = await derivedBytes.slice(sodium.crypto_secretbox_KEYBYTES,derivedBytes.length);
  console.log("Done");

  masterKey = sodium.crypto_secretbox_open(publicEncryptedMasterKey, derivedNonce, derivedKey);
  if (!masterKey) {
    throw new Error("Wrong password");
  }
  return masterKey;
}

async function encryptDeployerKey(password, deployerKey) {
  masterKey = await getMasterKey(password);
  nonce = Buffer.allocUnsafe(sodium.crypto_secretbox_NONCEBYTES);
  sodium.randombytes(nonce);
  publicEncryptedDeployerKey = sodium.crypto_secretbox(deployerKey, nonce, masterKey);
  fs.writeFile('publicEncryptedDeployerKey.bin', nonce, function(err) {
    if (err) throw err;
  });
  fs.appendFile('publicEncryptedDeployerKey.bin', publicEncryptedDeployerKey, function(err) {
    if (err) throw err;
  });
  console.log("Encrypted deployer key file saved");
}

async function decryptDeployerKey(password) {
  deployerKeyFile = await readDeployerKeyFile();
  masterKey = await getMasterKey(password);
  nonce = await deployerKeyFile.slice(0, sodium.crypto_secretbox_NONCEBYTES);
  publicEncryptedDeployerKey = await deployerKeyFile.slice(sodium.crypto_secretbox_NONCEBYTES, deployerKeyFile.length)

  decryptedDeployerKey = sodium.crypto_secretbox_open(publicEncryptedDeployerKey, nonce, masterKey);
  console.log("Decrypted deployer key");
  return decryptedDeployerKey;
}

module.exports = {
  createPassword,
  getMasterKey,
  encryptDeployerKey,
  decryptDeployerKey,
};
