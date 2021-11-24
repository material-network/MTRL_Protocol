import { expect } from 'chai';
import { constants } from 'ethers';
import { expandToDecimals, permit } from '../helpers/utils';
import { runTestSuite, TestVars, totalSupply, userBalance } from './lib';

const amount = expandToDecimals(1, 18);

runTestSuite('MTRL', (vars: TestVars) => {
  it('metadata', async () => {
    const { MTRL } = vars;

    expect(await MTRL.name()).to.be.eq('Material');
    expect(await MTRL.symbol()).to.be.eq('MTRL');
  });

  describe('mint', async () => {
    it('reverted cases', async () => {
      const {
        MTRL,
        accounts: [denis],
        admin,
      } = vars;

      // when noAdmins trying to mint new tokens
      await expect(MTRL.connect(denis.signer).mint(denis.address, 1)).to.be.revertedWith(
        'onlyAdmin: caller is not the owner'
      );

      // when trying to 0 mint token
      await expect(MTRL.connect(admin.signer).mint(denis.address, 0)).to.be.revertedWith(
        'mint: _amount is invalid'
      );

      // when trying to mint token to zero address
      await expect(MTRL.connect(admin.signer).mint(constants.AddressZero, 0)).to.be.revertedWith(
        'mint: _addr is invalid'
      );

      // when trying to mint more than total supply
      await MTRL.connect(admin.signer).mint(admin.address, totalSupply.div(2));
      await expect(MTRL.connect(admin.signer).mint(admin.address, 1)).to.be.revertedWith(
        'mint: exceeds total supply'
      );
    });

    it('success', async () => {
      const {
        MTRL,
        accounts: [denis, admin],
      } = vars;

      await MTRL.connect(admin.signer).mint(denis.address, amount);
      const denisBalance = await MTRL.balanceOf(denis.address);
      expect(denisBalance).to.be.eq(userBalance.add(amount));
    });
  });

  describe('set new admins', async () => {
    it('reverted cases', async () => {
      const {
        MTRL,
        accounts: [denis],
        admin,
      } = vars;

      // when noAdmins trying to set admin
      await expect(MTRL.connect(denis.signer).setAdmin(denis.address, true)).to.be.revertedWith(
        'onlyAdmin: caller is not the owner'
      );

      // when trying to set invalid admin
      await expect(
        MTRL.connect(admin.signer).setAdmin(constants.AddressZero, true)
      ).to.be.revertedWith('setAdmin: _addr is invalid');
    });

    it('success', async () => {
      const {
        MTRL,
        admin,
        accounts: [denis],
      } = vars;

      await MTRL.connect(admin.signer).setAdmin(denis.address, true);
      expect(await MTRL.isAdmin(denis.address)).to.be.true;
      await MTRL.connect(denis.signer).setAdmin(denis.address, false);
      expect(await MTRL.isAdmin(denis.address)).to.be.false;
    });
  });

  describe('transfer', async () => {
    it('reverted cases when transfer is disabled', async () => {
      const {
        MTRL,
        accounts: [denis, admin, stephon],
      } = vars;

      await MTRL.connect(admin.signer).setTransfersAllowed(false);
      await expect(MTRL.connect(denis.signer).transfer(stephon.address, 1)).to.be.revertedWith(
        'transfer: transfer is disabled'
      );
    });

    it('success', async () => {
      const {
        MTRL,
        accounts: [denis, admin, stephon],
      } = vars;

      await MTRL.connect(denis.signer).transfer(stephon.address, amount);
      expect(await MTRL.balanceOf(denis.address)).to.be.eq(userBalance.sub(amount));
      expect(await MTRL.balanceOf(stephon.address)).to.be.eq(userBalance.add(amount));
    });
  });

  it('permit', async () => {
    const {
      MTRL,
      accounts: [denis, admin, stephon],
    } = vars;

    await permit(MTRL, admin, stephon, amount);
    expect(await MTRL.allowance(admin.address, stephon.address)).to.be.eq(amount);
  });
});
