const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Token", function () {
  async function deployToken() {
    const [owner, otherAccount, caller] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy();

    return { token, owner, otherAccount, caller };
  }

  describe("Approve", function () {
    it("Should approve with correct args: ", async function() {
      const { token, owner, otherAccount } = await loadFixture(deployToken);

      const amount = 1000;
      
      await token.approve(otherAccount.address, amount);
      
      expect(await token.allowance(owner.address, otherAccount.address)).to.equal(amount);
    });

    it("Should emit Approve event", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployToken);

      const amount = 1000;

      await expect(token.approve(otherAccount.address, amount)).to.emit(token, "Approve").withArgs(owner.address, otherAccount.address, amount);
    });

    it("Should fail if it aren't owner", async function () {
      const { token, otherAccount, caller } = await loadFixture(deployToken);

      const amount = 1000;

      await expect(token.connect(otherAccount).approve(caller.address, amount)).to.be.revertedWith("Token: You aren't owner");
    });

    it("Should fail if the spender doesn't have enough funds", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployToken);

      const ownerBalance = await token.balanceOf(owner.address);

      await expect(token.approve(otherAccount.address, ownerBalance + 1)).to.be.revertedWith("Token: Not enough funds");
    });
  });

  describe("Transfer", function () {
    it("Should transfer with correct args: ", async function() {
      const { token, owner, otherAccount } = await loadFixture(deployToken);

      const amount = 1000;

      await expect(token.transfer(otherAccount.address, amount)).to.changeTokenBalances(
        token,
        [owner, otherAccount],
        [0 - amount, amount]
      );
    });

    it("Should emit Transfer event", async function () {
      const { token, owner, otherAccount, caller } = await loadFixture(deployToken);

      const amount = 1000;

      await expect(token.transfer(otherAccount.address, amount)).to.emit(token, "Transfer").withArgs(owner.address, otherAccount.address, amount);
      await token.editWhiteList(otherAccount.address);
      await expect(token.connect(otherAccount).transfer(caller.address, amount)).to.emit(token, "Transfer").withArgs(otherAccount.address, caller.address, amount);
    });

    it("Should fail if the spender doesn't in white list", async function () {
      const { token, otherAccount, caller } = await loadFixture(deployToken);

      const amount = 1000;

      await expect(token.connect(otherAccount).transfer(caller.address, amount)).to.be.revertedWith("Token: You doesn't in whiteList");
    });
    
    it("Should fail if the spender doesn't have enough funds", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployToken);

      const ownerBalance = await token.balanceOf(owner.address);

      await expect(token.transfer(otherAccount.address, ownerBalance + 1)).to.be.revertedWith("Token: Not enough funds");
    });
  });

  describe("TransferFrom", function () {
    it("Should transferFrom with correct args: ", async function() {
      const { token, owner, otherAccount, caller } = await loadFixture(deployToken);

      const amount = 1000;

      await token.approve(otherAccount.address, 2 * amount);
      await token.editWhiteList(otherAccount.address);

      await expect(token.connect(otherAccount).transferFrom(owner.address, caller.address, amount)).to.changeTokenBalances(
        token,
        [owner, caller],
        [0 - amount, amount]
      );
      
      expect(await token.allowance(owner.address, otherAccount.address)).to.equal(amount);
    });

    it("Should emit Transfer event", async function () {
      const { token, owner, otherAccount, caller } = await loadFixture(deployToken);

      const amount = 1000;
      await token.approve(otherAccount.address, amount);
      await token.editWhiteList(otherAccount.address);

      await expect(token.connect(otherAccount).transferFrom(owner.address, caller.address, amount)).to.emit(token, "Transfer").withArgs(owner.address, caller.address, amount);
    });

    it("Should fail if the spender doesn't in white list", async function () {
      const { token, owner, otherAccount, caller } = await loadFixture(deployToken);

      const amount = 1000;
      await token.approve(otherAccount.address, amount);

      await expect(token.connect(otherAccount).transferFrom(owner.address, caller.address, amount)).to.be.revertedWith("Token: You doesn't in whiteList");
    });
    
    it("Should fail if the spender doesn't have enough allowance", async function () {
      const { token, owner, otherAccount, caller } = await loadFixture(deployToken);

      const amount = 1000;
      await token.approve(otherAccount.address, amount);
      await token.editWhiteList(otherAccount.address);

      await expect(token.connect(otherAccount).transferFrom(owner.address, caller.address, amount + 1)).to.be.revertedWith("Token: Not enough allowance");
    });
  });

  describe("Mint", function () {
    it("Should mint with correct args: ", async function() {
        const { token, owner, otherAccount } = await loadFixture(deployToken);

        const amount = 1000;
        await token.mint(otherAccount.address, amount);
        await token.mint(owner.address, amount);
  
        expect(await token.balanceOf(otherAccount.address)).to.equal(amount);
        expect(await token.balanceOf(owner.address)).to.equal(1000000 + amount);
        expect(await token.getTotalSupply()).to.equal(1000000 + 2*amount);
    });

    it("Should fail if it aren't owner", async function () {
      const { token, otherAccount } = await loadFixture(deployToken);

      const amount = 1000;

      await expect(token.connect(otherAccount).mint(otherAccount.address, amount)).to.be.revertedWith("Token: You aren't owner");
    });
  });
  
  describe("Burn", function () {
    it("Should burn with correct args: ", async function() {
        const { token, owner } = await loadFixture(deployToken);

        const amount = 1000;
        await token.burn(owner.address, amount);
  
        expect(await token.balanceOf(owner.address)).to.equal(1000000 - amount);
        expect(await token.getTotalSupply()).to.equal(1000000 - amount);
    });

    it("Should fail if it aren't owner", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployToken);

      const amount = 1000;

      await expect(token.connect(otherAccount).burn(owner.address, amount)).to.be.revertedWith("Token: You aren't owner");
    });

    it("Should fail if the spender doesn't have enough funds", async function () {
      const { token, otherAccount } = await loadFixture(deployToken);

      const amount = 1000;

      await expect(token.burn(otherAccount.address, amount)).to.be.revertedWith("Token: Not enough funds");
    });
  });

  describe("Buy", function () {
    it("Should buy with correct args: ", async function() {
        const { token, owner } = await loadFixture(deployToken);

        const amount = 1000;

        await expect(await token.buy({ value: amount })).to.changeEtherBalance(token, amount);
        expect(await token.balanceOf(owner.address)).to.equal(1000000 - amount);
    });
  });

  describe("Sell", function () {
    it("Should sell with correct args: ", async function() {
        const { token, owner } = await loadFixture(deployToken);

        const amount = 1000;
        await token.buy({ value: 2*amount })

        await expect(await token.sell(amount)).to.changeEtherBalance(token, 0 - amount);
        expect(await token.balanceOf(owner.address)).to.equal(1000000 - amount);
    });
  });

  describe("EditWhiteList", function () {
    it("Should editWhiteList with correct args: ", async function() {
        const { token, otherAccount } = await loadFixture(deployToken);

        const status = token.getWhiteList[otherAccount.address]
        token.editWhiteList(otherAccount.address);

        expect(await token.getWhiteList(otherAccount.address)).to.equal(!status);
    });
  });

  /*
    function editWhiteList (address spender) public returns(bool){
        whiteLists[spender] = !whiteLists[spender];
        return true;
    }
  */

});
