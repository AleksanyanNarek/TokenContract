const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Token", function () {
  async function deployToken() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy();

    return { token, owner, otherAccount };
  }

  describe("Approve", function () {
    it("Should approve with correct args: ", async function() {
      const { token, owner, otherAccount } = await loadFixture(deployToken);
      
      await token.approve(otherAccount.address, 1000);
      
      expect(await token.allowance(owner.address, otherAccount.address)).to.equal(1000);
    });
  });
  
  describe("Transfer", function () {
    it("Should transfer with correct args: ", async function() {
      const { token, otherAccount } = await loadFixture(deployToken);

      await token.transfer(otherAccount.address, 1000);
      
      expect(await token.balanceOf(otherAccount.address)).to.equal(1000);
    });
  });

  describe("TransferFrom", function () {
    it("Should transferFrom with correct args: ", async function() {
      const { token, owner, otherAccount } = await loadFixture(deployToken);
      
      await token.approve(otherAccount.address, 2000);
      await token.transferFrom(owner.address, otherAccount.address, 1000);
      
      expect(await token.allowance(owner.address, otherAccount.address)).to.equal(1000);
    });
  });

  describe("Mint", function () {
    it("Should mint with correct args: ", async function() {
        const { token, owner} = await loadFixture(deployToken);
    
        await token.mint(owner.address, 1000);
  
        expect(await token.balanceOf(owner.address)).to.equal(1001000);
        expect(await token.getTotalSupply()).to.equal(1001000);
    });
  
  });
  
  describe("Burn", function () {
    it("Should burn with correct args: ", async function() {
        const { token, owner} = await loadFixture(deployToken);
    
        await token.burn(owner.address, 1000);
  
        expect(await token.balanceOf(owner.address)).to.equal(999000);
        expect(await token.getTotalSupply()).to.equal(999000);
    });
  });

  describe("Buy", function () {
    it("Should buy with correct args: ", async function() {
        const { token} = await loadFixture(deployToken);

        await token.buy({value: 1000});

        await expect(await token.buy({ value: 1000 })).to.changeEtherBalance(token, 1000);
    });
  });

  /*
  function buy (address from) public payable {
        _mint(from, msg.value);
    }
  */

});
