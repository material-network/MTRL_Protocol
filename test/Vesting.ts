import { expect } from 'chai';
import { constants } from 'ethers';

import { expandToDecimals } from '../helpers/utils';
import { runTestSuite, TestVars, advanceBlocks } from './lib';
import { UNLOCK_CYCLE_TEST_NNET, START_VESTING_AFTER_BLOCKS } from '../helpers/constants';

const amount = expandToDecimals(1, 18);
const UnlockAmount = expandToDecimals(1000000, 18);
const VestingBalance = UnlockAmount.mul(18);

runTestSuite('MTRLVesting', (vars: TestVars) => {
  describe('reveted cases', async () => {
    it('claim reverted before start vesting', async () => {
      const { MTRLVesting } = vars;
      await expect(MTRLVesting.claim()).to.be.revertedWith('claim: vesting not started');
    });

    it('setWallet reverted ', async () => {
      const {
        MTRLVesting,
        accounts: [deployer, admin, wallet, newWallet],
      } = vars;

      await expect(MTRLVesting.setWallet(newWallet.address)).to.be.revertedWith(
        'onlyAdmin: caller is not the owner'
      );

      await expect(
        MTRLVesting.connect(admin.signer).setWallet(constants.AddressZero)
      ).to.be.revertedWith('setWallet: invalid wallet');

      await expect(MTRLVesting.connect(admin.signer).setWallet(wallet.address)).to.be.revertedWith(
        'setWallet: invalid wallet'
      );
    });

    it('reverted since empty balance reverted ', async () => {
      const { MTRLVesting } = vars;

      await advanceBlocks(START_VESTING_AFTER_BLOCKS);
      await expect(MTRLVesting.claim()).to.be.revertedWith('claim: no tokens');
    });
  });

  describe('success cases', async () => {
    it('set new Wallet', async () => {
      const {
        MTRLVesting,
        accounts: [deployer, admin, wallet, newWallet],
      } = vars;

      expect(await MTRLVesting.wallet()).to.be.equal(wallet.address);
      await MTRLVesting.connect(admin.signer).setWallet(newWallet.address);
      expect(await MTRLVesting.wallet()).to.be.equal(newWallet.address);
    });

    it('vesting process', async () => {
      const {
        MTRLVesting,
        MTRL,
        accounts: [deployer, admin, wallet],
      } = vars;

      // transfer vesting amount
      await MTRL.connect(admin.signer).transfer(MTRLVesting.address, VestingBalance);

      // start vesting
      await advanceBlocks(START_VESTING_AFTER_BLOCKS + 1);

      // doing claim before one month
      await expect(await MTRLVesting.claim())
        .to.emit(MTRLVesting, 'CLAIMED')
        .withArgs(0, 0, wallet.address);

      let prevVestingBalance;
      let afterVestingBalance;
      let prevWalletBalance;
      let afterWalletBalance;

      // after one month
      await advanceBlocks(UNLOCK_CYCLE_TEST_NNET);

      for (let i = 1; i <= 18; i++) {
        prevVestingBalance = await MTRL.balanceOf(MTRLVesting.address);
        prevWalletBalance = await MTRL.balanceOf(wallet.address);

        // doing claim
        await expect(await MTRLVesting.claim())
          .to.emit(MTRLVesting, 'CLAIMED')
          .withArgs(UnlockAmount, i, wallet.address);

        afterVestingBalance = await MTRL.balanceOf(MTRLVesting.address);
        expect(afterVestingBalance).to.be.eq(prevVestingBalance.sub(UnlockAmount));

        afterWalletBalance = await MTRL.balanceOf(wallet.address);
        expect(afterWalletBalance).to.be.eq(prevWalletBalance.add(UnlockAmount));

        if (i < 18) {
          prevVestingBalance = afterVestingBalance;
          prevWalletBalance = afterWalletBalance;

          // doing again soon
          await expect(await MTRLVesting.claim())
            .to.emit(MTRLVesting, 'CLAIMED')
            .withArgs(0, i, wallet.address);

          afterVestingBalance = await MTRL.balanceOf(MTRLVesting.address);
          expect(afterVestingBalance).to.be.eq(prevVestingBalance);

          afterWalletBalance = await MTRL.balanceOf(wallet.address);
          expect(afterWalletBalance).to.be.eq(prevWalletBalance);
        } else {
          // last month
          await expect(MTRLVesting.claim()).to.be.revertedWith('claim: no tokens');
        }

        await advanceBlocks(UNLOCK_CYCLE_TEST_NNET);
      }

      await expect(MTRLVesting.claim()).to.be.revertedWith('claim: no tokens');
    });
  });
});
