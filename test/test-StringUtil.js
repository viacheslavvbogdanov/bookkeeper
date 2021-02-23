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
    it("should return many for many char strings", async function () {
      expect(await stringUtil.strLength("abc")).to.equal(3);
    });
  });
  describe("strConcat", async function () {
    it("should handle two empty strings", async function () {
      expect(await stringUtil.strConcat("", "")).to.equal("");
    });
    it("should handle empty 'a' atring", async function () {
      expect(await stringUtil.strConcat("", "foo")).to.equal("foo");
    });
    it("should handle empty 'b' string", async function () {
      expect(await stringUtil.strConcat("bar", "")).to.equal("bar");
    });
    it("should concat two characters", async function () {
      expect(await stringUtil.strConcat("a", "b")).to.equal("ab");
    });
    it("should concat longer strigns characters", async function () {
      expect(await stringUtil.strConcat("foo", "bar")).to.equal("foobar");
    });
  });
  describe("strCompare", async function () {
    it("should return true for two empty strings", async function () {
      expect(await stringUtil.strCompare("", "")).to.be.true;
    });
    it("should return false for one empty string and one char string", async function () {
      expect(await stringUtil.strCompare("a", "")).to.be.false;
    });
    it("should return true for two equal single char strings", async function () {
      expect(await stringUtil.strCompare("a", "a")).to.be.true;
    });
    it("should return false for two different single char strings", async function () {
      expect(await stringUtil.strCompare("a", "b")).to.be.false;
    });
    it("should return false for two different strings", async function () {
      expect(await stringUtil.strCompare("foo", "bar")).to.be.false;
    });
    it("should return true for two equal strings", async function () {
      expect(await stringUtil.strCompare("foo", "foo")).to.be.true;
    });
  });
});
