const {ethers, getNamedAccounts} = require("hardhat");
const {expect} = require('chai');

const assert = require('assert');

// Vanilla Mocha test. Increased compatibility with tools that integrate Mocha.
describe("ContractRegistry: Testing all functionality", function () {

    let registry, governance;

    const address0 = "0x0000000000000000000000000000000000000000";
    const address1 = "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32";
    const address2 = "0xc35DADB65012eC5796536bD9864eD8773aBc74C4";
    const address3 = "0xa98ea6356A316b44Bf710D5f9b6b4eA0081409Ef";

    before(async function () {
        console.log("Setting up contract")
        const {deployer} = await getNamedAccounts();
        governance = deployer;

        const Registry = await ethers.getContractFactory("ContractRegistry");
        registry = await Registry.deploy();
        await registry.deployed();

    });

    it("Should return empty array", async function () {
        const addresses = await registry.list()
        assert(addresses.length === 0)
    })

    it("Should not add address(0)", async function () {
        await expect(registry.add(address0))
            .to.be.reverted;
    })

    it("Should add address1 and emit AddressAdded", async function () {
        await expect(registry.add(address1))
            .to.emit(registry, 'AddressAdded')
            .withArgs(address1);
    })

    it("Should return array[1] with address1", async function () {
        const addresses = await registry.list()
        assert(addresses.length === 1)
        assert(addresses[0] === address1)
    })

    it("Should not add address1 again", async function () {
        await expect(registry.add(address1))
            .to.be.revertedWith('Already in list');
    })

    it("Should remove address1 and emit AddressRemoved", async function () {
        await expect(registry.remove(address1))
            .to.emit(registry, 'AddressRemoved')
            .withArgs(address1);
    })

    it("Should not remove address1 again", async function () {
        await expect(registry.remove(address1))
            .to.be.revertedWith('Not in list');
    })

    it("Should return empty array", async function () {
        const addresses = await registry.list()
        assert(addresses.length === 0)
    })

    it("Should add address1,address2 and emit AddressAdded", async function () {
        await expect(registry.addArray([address1,address2]))
            .to.emit(registry, 'AddressAdded')
            .withArgs(address1)
            .to.emit(registry, 'AddressAdded')
            .withArgs(address2)
    })

    it("Should return array[2] with address1,2", async function () {
        const addresses = await registry.list()
        assert(addresses.length === 2)
        assert(addresses[0] === address1)
        assert(addresses[1] === address2)
    })

    it("Should remove address1,address2 and emit AddressRemoved", async function () {
        await expect(registry.removeArray([address2,address1]))
            .to.emit(registry, 'AddressRemoved')
            .withArgs(address1)
            .to.emit(registry, 'AddressRemoved')
            .withArgs(address2)
    })


    it("Should remove right address", async function () {
        await registry.addArray([address1,address2,address3])

        await registry.remove(address1)
        await expect(registry.remove(address1))
            .to.be.revertedWith('Not in list');

        await registry.remove(address3)
        await expect(registry.remove(address3))
            .to.be.revertedWith('Not in list');

        await registry.remove(address2)
        await expect(registry.remove(address2))
            .to.be.revertedWith('Not in list');
    })

    it("Should deny access to add & remove", async function () {
        const [owner, account2] = await ethers.getSigners();
        await expect(registry.connect(account2).add(address1))
            .to.be.revertedWith('Not governance');
        await expect(registry.connect(account2).remove(address1))
            .to.be.revertedWith('Not governance');
    })

    it("Should deny access to addArray & removeArray", async function () {
        const [owner, account2] = await ethers.getSigners();
        await expect(registry.connect(account2).addArray([address1,address2]))
            .to.be.revertedWith('Not governance');
        await expect(registry.connect(account2).removeArray([address1,address2]))
            .to.be.revertedWith('Not governance');
    })


});
