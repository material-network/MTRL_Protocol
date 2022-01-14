import { expect } from 'chai';
import { constants } from 'ethers';

import { runTestSuite, TestVars, advanceBlocks, VestingAmount } from './lib';

runTestSuite('MTRLVesting', (vars: TestVars) => {
  it('meta', async () => {
    const {
      MTRL,
      MTRLVesting,
      vestingUnlockCycle,
      accounts: [deployer, admin, wallet],
    } = vars;

    expect(await MTRLVesting.token()).to.be.equal(MTRL.address);
    expect(await MTRLVesting.wallet()).to.be.equal(wallet.address);
    expect(await MTRLVesting.admin()).to.be.equal(admin.address);
    expect(await MTRLVesting.UNLOCK_CYCLE()).to.be.equal(vestingUnlockCycle.toString());
  });

  describe('transferOwnership', async () => {
    it('reverted cases', async () => {
      const {
        MTRLVesting,
        accounts: [deployer, admin, wallet],
      } = vars;

      await expect(
        MTRLVesting.connect(deployer.signer).transferOwnership(wallet.address)
      ).to.be.revertedWith('onlyAdmin: caller is not the owner');

      await expect(
        MTRLVesting.connect(admin.signer).transferOwnership(constants.AddressZero)
      ).to.be.revertedWith('transferOwnership: invalid admin');

      await expect(
        MTRLVesting.connect(admin.signer).transferOwnership(admin.address)
      ).to.be.revertedWith('transferOwnership: invalid admin');
    });

    it('success cases', async () => {
      const {
        MTRLVesting,
        accounts: [deployer, admin, newAdmin],
      } = vars;

      await expect(MTRLVesting.connect(admin.signer).transferOwnership(newAdmin.address))
        .to.emit(MTRLVesting, 'SetAdmin')
        .withArgs(newAdmin.address);
    });
  });

  describe('setWallet', async () => {
    it('reverted cases', async () => {
      const {
        MTRLVesting,
        accounts: [deployer, admin, wallet],
      } = vars;

      await expect(
        MTRLVesting.connect(deployer.signer).setWallet(wallet.address)
      ).to.be.revertedWith('onlyAdmin: caller is not the owner');

      await expect(
        MTRLVesting.connect(admin.signer).setWallet(constants.AddressZero)
      ).to.be.revertedWith('setWallet: invalid wallet');

      await expect(MTRLVesting.connect(admin.signer).setWallet(wallet.address)).to.be.revertedWith(
        'setWallet: invalid wallet'
      );
    });

    it('success cases', async () => {
      const {
        MTRLVesting,
        accounts: [deployer, admin, wallet, newWallet],
      } = vars;

      expect(await MTRLVesting.wallet()).to.be.equal(wallet.address);

      await expect(MTRLVesting.connect(admin.signer).setWallet(newWallet.address))
        .to.emit(MTRLVesting, 'SetWallet')
        .withArgs(newWallet.address);
    });
  });

  describe('claim', async () => {
    it('reverted cases', async () => {
      const { MTRL, MTRLVesting, vestingUnlockCycle } = vars;

      await expect(MTRLVesting.claim()).to.be.revertedWith('claim: not claimable yet');
      await advanceBlocks(vestingUnlockCycle);
      await expect(MTRLVesting.claim()).to.be.revertedWith('claim: no tokens');
    });

    it('success cases', async () => {
      const {
        MTRL,
        MTRLVesting,
        vestingUnlockCycle,
        accounts: [deployer, admin, wallet],
      } = vars;

      await MTRL.connect(admin.signer).transfer(MTRLVesting.address, VestingAmount);
      const UnlockAmount = await MTRLVesting.UNLOCK_AMOUNT();

      // claim for the first 16 months
      for (let i = 1; i <= 16; i++) {
        await advanceBlocks(vestingUnlockCycle);

        let prevVestingBalance = await MTRL.balanceOf(MTRLVesting.address);
        let prevWalletBalance = await MTRL.balanceOf(wallet.address);
        expect(await MTRLVesting.unlockedAmount(i)).to.equal(0);

        await MTRLVesting.claim();
        expect(await MTRLVesting.unlockedAmount(i)).to.equal(UnlockAmount);

        let afterVestingBalance = await MTRL.balanceOf(MTRLVesting.address);
        expect(afterVestingBalance).to.be.eq(prevVestingBalance.sub(UnlockAmount));

        let afterWalletBalance = await MTRL.balanceOf(wallet.address);
        expect(afterWalletBalance).to.be.eq(prevWalletBalance.add(UnlockAmount));

        // claim again soon
        prevVestingBalance = afterVestingBalance;
        prevWalletBalance = afterWalletBalance;

        await MTRLVesting.claim();
        afterVestingBalance = await MTRL.balanceOf(MTRLVesting.address);
        expect(afterVestingBalance).to.be.eq(prevVestingBalance);

        afterWalletBalance = await MTRL.balanceOf(wallet.address);
        expect(afterWalletBalance).to.be.eq(prevWalletBalance);
      }

      // after 4 month from last Claim
      await advanceBlocks(vestingUnlockCycle * 4);

      expect(await MTRLVesting.unlockedAmount(17)).to.equal(0);
      expect(await MTRLVesting.unlockedAmount(18)).to.equal(0);
      expect(await MTRLVesting.unlockedAmount(19)).to.equal(0);
      expect(await MTRLVesting.unlockedAmount(20)).to.equal(0);

      await MTRLVesting.claim();

      expect(await MTRLVesting.unlockedAmount(17)).to.equal(UnlockAmount);
      expect(await MTRLVesting.unlockedAmount(18)).to.equal(UnlockAmount);
      expect(await MTRLVesting.unlockedAmount(19)).to.equal(0);
      expect(await MTRLVesting.unlockedAmount(20)).to.equal(0);

      await expect(MTRLVesting.claim()).to.be.revertedWith('claim: no tokens');

      // transfer some more tokens
      await MTRL.connect(admin.signer).transfer(MTRLVesting.address, 100);
      await MTRLVesting.claim();
      expect(await MTRLVesting.unlockedAmount(19)).to.equal(100);
    });
  });
});
