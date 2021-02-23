async function main() {

  const [deployer] = await ethers.getSigners();

  console.log(
    "Deploying contracts with the account:",
    deployer.address
  );

  // console.log("Account balance:", (await deployer.getBalance()).toString());

  const Storage = await ethers.getContractFactory("Storage");
  const storage = await Storage.deploy();
  console.log("Storage address:", storage.address);


  const OracleRopsten = await ethers.getContractFactory("OracleRopsten");
  const oracleRopsten = await OracleRopsten.deploy(storage.address);

  console.log("Oracle address:", oracleRopsten.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
