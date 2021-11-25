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
    it('reverted cases when trying to mint', async () => {
      const {
        MTRL,
        accounts: [denis],
        admin,
      } = vars;

      // when noAdmins trying to mint new tokens
      await expect(MTRL.connect(denis.signer).mint(denis.address, 1)).to.be.revertedWith(
        'mint: no permission to mint tokens'
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

    it('success when call setMinter & mint functions', async () => {
      const {
        MTRL,
        accounts: [minter, admin],
      } = vars;

      await MTRL.connect(admin.signer).setMinter(minter.address, true);
      await MTRL.connect(minter.signer).mint(minter.address, amount);
      const minterBalance = await MTRL.balanceOf(minter.address);
      expect(minterBalance).to.be.eq(userBalance.add(amount));
    });
  });

  describe('setTransfersAllowed', async () => {
    it('reverted when trying without admin permissions', async () => {
      const {
        MTRL,
        accounts: [denis, admin],
      } = vars;

      // when non-admin calls setTransfersAllowed
      await expect(MTRL.connect(denis.signer).setTransfersAllowed(false)).to.be.revertedWith(
        'onlyAdmin: caller is not the owner'
      );
    });

    it('success when call setTransferAllowed', async () => {
      const {
        MTRL,
        accounts: [denis, admin, stephon],
      } = vars;

      // set transfersAllowed to false
      await MTRL.connect(admin.signer).setTransfersAllowed(false);
      expect(await MTRL.transfersAllowed()).to.be.false;
      await expect(MTRL.connect(admin.signer).transfer(denis.address, amount)).to.be.revertedWith(
        '_beforeTokenTransfer: transfer is disabled'
      );

      // set transfersAllowed to true
      await MTRL.connect(admin.signer).setTransfersAllowed(true);
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
