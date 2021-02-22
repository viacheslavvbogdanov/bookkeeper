const { expect } = require("chai");

describe("StringUtil", function () {
  let StringUtil;
  let stringUtil;
  before(async function () {
    StringUtil = await ethers.getContractFactory("TestStringUtil");
    stringUtil = await StringUtil.deploy();
  });

  describe("strLength", async function () {
    it("should return zero for empty strings", async function () {
      expect(await stringUtil.strLength("")).to.equal(0);
    });
    it("should return one for single char strings", async function () {
      expect(await stringUtil.strLength("a")).to.equal(1);
    });
  });
});
