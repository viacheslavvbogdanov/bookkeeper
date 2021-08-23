const {ethers, getNamedAccounts } = require("hardhat");
const {expect} = require('chai');
const {BigNumber} = require("ethers");
const assert = require('assert');


let registry, libTest, governance;

const address1 = "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32";
const address2 = "0xc35DADB65012eC5796536bD9864eD8773aBc74C4";
const address3 = "0xa98ea6356A316b44Bf710D5f9b6b4eA0081409Ef";

const number1 = BigNumber.from(1);
const number2 = BigNumber.from(2);
const number3 = BigNumber.from(3);

before(async function () {
    console.log("Setting up contract")
    const {deployer} = await getNamedAccounts();
    governance = deployer;

    const Registry = await ethers.getContractFactory("ContractRegistry");
    registry = await Registry.deploy();
    await registry.deployed();

    const LibTest = await ethers.getContractFactory("ArrayLibTest");
    libTest = await LibTest.deploy();
    await libTest.deployed();

});

describe("ArrayLibTest: Addresses", function () {

    it("Should return empty array", async function () {
        const addresses = await libTest.listAddresses()
        assert(addresses.length === 0)
    })

    it("Should add address1 and return array[1] with address1", async function () {
        await libTest.addAddress(address1)
        const addresses = await libTest.listAddresses()
        assert(addresses.length === 1)
        assert(addresses[0] === address1)
    })

    it("Should not add address1 again", async function () {
        await expect(libTest.addAddress(address1))
            .to.be.revertedWith('Already in array');
    })

    it("Should not remove address1 again", async function () {
        await libTest.removeAddress(address1)
        await expect(libTest.removeAddress(address1))
            .to.be.revertedWith('Not in array');
    })

    it("Should return empty array", async function () {
        const addresses = await libTest.listAddresses()
        assert(addresses.length === 0)
    })

    it("Should add address1,2 and return array[2] with address1,2", async function () {
        await libTest.addAddressArray([address1,address2])
        const addresses = await libTest.listAddresses()
        assert(addresses.length === 2)
        assert(addresses[0] === address1)
        assert(addresses[1] === address2)
    })

    it("Should remove address1,address2", async function () {
        await libTest.removeAddressArray([address2,address1])
        const addresses = await libTest.listAddresses()
        assert(addresses.length === 0)
    })

    it("Should remove right address", async function () {
        await libTest.addAddressArray([address1,address2,address3])

        await libTest.removeAddress(address1)
        await expect(libTest.removeAddress(address1))
            .to.be.revertedWith('Not in array');

        await libTest.removeAddress(address3)
        await expect(libTest.removeAddress(address3))
            .to.be.revertedWith('Not in array');

        await libTest.removeAddress(address2)
        await expect(libTest.removeAddress(address2))
            .to.be.revertedWith('Not in array');
    })

});

describe("ArrayLibTest: Numbers", function () {

    it("Should return empty array", async function () {
        const numbers = await libTest.listNumbers()
        assert(numbers.length === 0)
    })

    it("Should add number1 and return array[1] with number1", async function () {
        await libTest.addNumber(number1)
        const numbers = await libTest.listNumbers()
        assert(numbers.length === 1)
        assert(number1.eq(numbers[0]))
    })

    it("Should not add number1 again", async function () {
        await expect(libTest.addNumber(number1))
            .to.be.revertedWith('Already in array');
    })

    it("Should not remove number1 again", async function () {
        await libTest.removeNumber(number1)
        await expect(libTest.removeNumber(number1))
            .to.be.revertedWith('Not in array');
    })

    it("Should return empty array", async function () {
        const numbers = await libTest.listNumbers()
        assert(numbers.length === 0)
    })

    it("Should add number1,2 and return array[2] with number1,2", async function () {
        await libTest.addNumberArray([number1,number2])
        const numbers = await libTest.listNumbers()
        assert(numbers.length === 2)
        assert(number1.eq(numbers[0]))
        assert(number2.eq(numbers[1]))
    })

    it("Should remove number1,number2", async function () {
        await libTest.removeNumberArray([number2,number1])
        const numbers = await libTest.listNumbers()
        assert(numbers.length === 0)
    })

    it("Should remove right number", async function () {
        await libTest.addNumberArray([number1,number2,number3])

        await libTest.removeNumber(number1)
        await expect(libTest.removeNumber(number1))
            .to.be.revertedWith('Not in array');

        await libTest.removeNumber(number3)
        await expect(libTest.removeNumber(number3))
            .to.be.revertedWith('Not in array');

        await libTest.removeNumber(number2)
        await expect(libTest.removeNumber(number2))
            .to.be.revertedWith('Not in array');
    })

});

describe("ContractRegistry: custom folder Addresses", function () {

    const folder = 555 // test folder

    it("Should return empty array", async function () {
        const addresses = await registry.list(folder)
        assert(addresses.length === 0)
    })

    it("Should add address1 and emit Added", async function () {
        await expect(registry.add(folder, address1))
            .to.emit(registry, 'AddressesAdded')
            .withArgs([address1]);
    })

    it("Should return array[1] with address1", async function () {
        const addresses = await registry.list(folder)
        assert(addresses.length === 1)
        assert(addresses[0] === address1)
    })

    it("Should not add address1 again", async function () {
        await expect(registry.add(folder, address1))
            .to.be.revertedWith('Already in array');
    })

    it("Should remove address1 and emit Removed", async function () {
        await expect(registry.remove(folder, address1))
            .to.emit(registry, 'AddressesRemoved')
            .withArgs([address1]);
    })

    it("Should not remove address1 again", async function () {
        await expect(registry.remove(folder, address1))
            .to.be.revertedWith('Not in array');
    })

    it("Should return empty array", async function () {
        const addresses = await registry.list(folder)
        assert(addresses.length === 0)
    })

    it("Should add address1,address2 and emit Added", async function () {
        await expect(registry.addArray(folder, [address1,address2]))
            .to.emit(registry, 'AddressesAdded')
            .withArgs([address1,address2])
    })

    it("Should return array[2] with address1,2", async function () {
        const addresses = await registry.list(folder)
        assert(addresses.length === 2)
        assert(addresses[0] === address1)
        assert(addresses[1] === address2)
    })

    it("Should remove address1,address2 and emit Removed", async function () {
        await expect(registry.removeArray(folder, [address2,address1]))
            .to.emit(registry, 'AddressesRemoved')
            .withArgs([address2,address1])
    })

    it("Should remove right address", async function () {
        await registry.addArray(folder, [address1,address2,address3])

        await registry.remove(folder, address1)
        await expect(registry.remove(folder, address1))
            .to.be.revertedWith('Not in array');

        await registry.remove(folder, address3)
        await expect(registry.remove(folder, address3))
            .to.be.revertedWith('Not in array');

        await registry.remove(folder, address2)
        await expect(registry.remove(folder, address2))
            .to.be.revertedWith('Not in array');
    })

    it("Should deny access to add & remove", async function () {
        const [, account2] = await ethers.getSigners();
        await expect(registry.connect(account2).add(folder, address1))
            .to.be.revertedWith('Not governance');
        await expect(registry.connect(account2).remove(folder, address1))
            .to.be.revertedWith('Not governance');
    })

    it("Should deny access to addArray & removeArray", async function () {
        const [, account2] = await ethers.getSigners();
        await expect(registry.connect(account2).addArray(folder, [address1,address2]))
            .to.be.revertedWith('Not governance');
        await expect(registry.connect(account2).removeArray(folder, [address1,address2]))
            .to.be.revertedWith('Not governance');
    })


});

describe("ContractRegistry: Pools", function () {

    it("Should return empty array", async function () {
        const addresses = await registry.listPools()
        assert(addresses.length === 0)
    })

    it("Should add address1 and emit PoolsAdded", async function () {
        await expect(registry.addPool(address1))
            .to.emit(registry, 'PoolsAdded')
            .withArgs([address1]);
    })

    it("Should return array[1] with address1", async function () {
        const addresses = await registry.listPools()
        assert(addresses.length === 1)
        assert(addresses[0] === address1)
    })

    it("Should not add address1 again", async function () {
        await expect(registry.addPool(address1))
            .to.be.revertedWith('Already in array');
    })

    it("Should remove address1 and emit PoolsRemoved", async function () {
        await expect(registry.removePool(address1))
            .to.emit(registry, 'PoolsRemoved')
            .withArgs([address1]);
    })

    it("Should not remove address1 again", async function () {
        await expect(registry.removePool(address1))
            .to.be.revertedWith('Not in array');
    })

    it("Should return empty array", async function () {
        const addresses = await registry.listPools()
        assert(addresses.length === 0)
    })

    it("Should add address1,address2 and emit PoolsAdded", async function () {
        await expect(registry.addPoolsArray([address1,address2]))
            .to.emit(registry, 'PoolsAdded')
            .withArgs([address1,address2])
    })

    it("Should return array[2] with address1,2", async function () {
        const addresses = await registry.listPools()
        assert(addresses.length === 2)
        assert(addresses[0] === address1)
        assert(addresses[1] === address2)
    })

    it("Should remove address1,address2 and emit PoolsRemoved", async function () {
        await expect(registry.removePoolsArray([address2,address1]))
            .to.emit(registry, 'PoolsRemoved')
            .withArgs([address2,address1])
    })

    it("Should remove right address", async function () {
        await registry.addPoolsArray([address1,address2,address3])

        await registry.removePool(address1)
        await expect(registry.removePool(address1))
            .to.be.revertedWith('Not in array');

        await registry.removePool(address3)
        await expect(registry.removePool(address3))
            .to.be.revertedWith('Not in array');

        await registry.removePool(address2)
        await expect(registry.removePool(address2))
            .to.be.revertedWith('Not in array');
    })

    it("Should deny access to add & remove", async function () {
        const [, account2] = await ethers.getSigners();
        await expect(registry.connect(account2).addPool(address1))
            .to.be.revertedWith('Not governance');
        await expect(registry.connect(account2).removePool(address1))
            .to.be.revertedWith('Not governance');
    })

    it("Should deny access to addArray & removeArray", async function () {
        const [, account2] = await ethers.getSigners();
        await expect(registry.connect(account2).addPoolsArray([address1,address2]))
            .to.be.revertedWith('Not governance');
        await expect(registry.connect(account2).removePoolsArray([address1,address2]))
            .to.be.revertedWith('Not governance');
    })


});

describe("ContractRegistry: Vaults", function () {

    it("Should return empty array", async function () {
        const addresses = await registry.listVaults()
        assert(addresses.length === 0)
    })

    it("Should add address1 and emit VaultsAdded", async function () {
        await expect(registry.addVault(address1))
            .to.emit(registry, 'VaultsAdded')
            .withArgs([address1]);
    })

    it("Should return array[1] with address1", async function () {
        const addresses = await registry.listVaults()
        assert(addresses.length === 1)
        assert(addresses[0] === address1)
    })

    it("Should not add address1 again", async function () {
        await expect(registry.addVault(address1))
            .to.be.revertedWith('Already in array');
    })

    it("Should remove address1 and emit VaultsRemoved", async function () {
        await expect(registry.removeVault(address1))
            .to.emit(registry, 'VaultsRemoved')
            .withArgs([address1]);
    })

    it("Should not remove address1 again", async function () {
        await expect(registry.removeVault(address1))
            .to.be.revertedWith('Not in array');
    })

    it("Should return empty array", async function () {
        const addresses = await registry.listVaults()
        assert(addresses.length === 0)
    })

    it("Should add address1,address2 and emit VaultsAdded", async function () {
        await expect(registry.addVaultsArray([address1,address2]))
            .to.emit(registry, 'VaultsAdded')
            .withArgs([address1,address2])
    })

    it("Should return array[2] with address1,2", async function () {
        const addresses = await registry.listVaults()
        assert(addresses.length === 2)
        assert(addresses[0] === address1)
        assert(addresses[1] === address2)
    })

    it("Should remove address1,address2 and emit VaultsRemoved", async function () {
        await expect(registry.removeVaultsArray([address2,address1]))
            .to.emit(registry, 'VaultsRemoved')
            .withArgs([address2,address1])
    })

    it("Should remove right address", async function () {
        await registry.addVaultsArray([address1,address2,address3])

        await registry.removeVault(address1)
        await expect(registry.removeVault(address1))
            .to.be.revertedWith('Not in array');

        await registry.removeVault(address3)
        await expect(registry.removeVault(address3))
            .to.be.revertedWith('Not in array');

        await registry.removeVault(address2)
        await expect(registry.removeVault(address2))
            .to.be.revertedWith('Not in array');
    })

    it("Should deny access to add & remove", async function () {
        const [, account2] = await ethers.getSigners();
        await expect(registry.connect(account2).addVault(address1))
            .to.be.revertedWith('Not governance');
        await expect(registry.connect(account2).removeVault(address1))
            .to.be.revertedWith('Not governance');
    })

    it("Should deny access to addArray & removeArray", async function () {
        const [, account2] = await ethers.getSigners();
        await expect(registry.connect(account2).addVaultsArray([address1,address2]))
            .to.be.revertedWith('Not governance');
        await expect(registry.connect(account2).removeVaultsArray([address1,address2]))
            .to.be.revertedWith('Not governance');
    })

});
