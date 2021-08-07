// Utilities
// noinspection JSUndeclaredVariable

const {artifacts, deployments, ethers} = require("hardhat");
const BigNumber = require("bignumber.js");
const {expect} = require('chai');
const { waffle } = require("hardhat");
const { deployContract } = waffle;
const ContractRegistry = artifacts.require("ContractRegistry");
// const { describe, it, before } = require('mocha');

const assert = require('assert');

// Vanilla Mocha test. Increased compatibility with tools that integrate Mocha.
describe("ContractRegistry: Testing all functionality", function () {

    let registry, governance;

    const address0 = "0x0000000000000000000000000000000000000000";
    const address1 = "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32";
    const address2 = "0xc35DADB65012eC5796536bD9864eD8773aBc74C4";
    const address3 = "0xa98ea6356A316b44Bf710D5f9b6b4eA0081409Ef";
    const address4 = "0x094d12e5b541784701fd8d65f11fc0598fbc6332";

    before(async function () {
        console.log("Setting up contract")
        const {deployer} = await getNamedAccounts();
        governance = deployer;
        // await deployments.fixture(['Registry']); // Execute deployment
        // const Registry = await deployments.get('ContractRegistry'); // Oracle is available because the fixture was executed
        // registry = await ContractRegistry.at(Registry.address);

        const Registry = await ethers.getContractFactory("ContractRegistry");
        registry = await Registry.deploy();
        await registry.deployed();

    });

    it("Should return empty array", async function () {
        const addresses = await registry.list()
        console.log('addresses', addresses);
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
        console.log('addresses', addresses);
        assert(addresses.length === 1)
        assert(addresses[0] === address1)
    })

    it("Should not add address1 again", async function () {
        await expect(registry.add(address1))
            .to.be.reverted;
    })


});
