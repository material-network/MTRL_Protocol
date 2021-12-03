import { expect } from 'chai';
import { constants } from 'ethers';
import { expandToDecimals, permit } from '../helpers/utils';
import { runTestSuite, TestVars, totalSupply, userBalance } from './lib';

const amount = expandToDecimals(1, 18);

runTestSuite('MTRL', (vars: TestVars) => {
  it('metadata', async () => {
    const {
      MTRL,
      accounts: [denis, admin],
    } = vars;

    expect(await MTRL.name()).to.be.eq('Material');
    expect(await MTRL.symbol()).to.be.eq('MTRL');
    expect(await MTRL.admin()).to.be.eq(admin.address);
    expect(await MTRL.totalSupply()).to.be.equal(expandToDecimals(100000000, 18));
    expect(await MTRL.transfersAllowed()).to.be.true;
  });

  it('permit', async () => {
    const {
      MTRL,
      accounts: [denis, admin, stephon],
    } = vars;

    await permit(MTRL, admin, stephon, amount);
    expect(await MTRL.allowance(admin.address, stephon.address)).to.be.eq(amount);
  });

  it('set transfer allow', async () => {
    const {
      MTRL,
      accounts: [denis, admin, stephon],
    } = vars;

    // reverted when non-admin calls setTransfersAllowed
    await expect(MTRL.connect(denis.signer).setTransfersAllowed(false)).to.be.revertedWith(
      'onlyAdmin: caller is not the owner'
    );

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

  it('transfer ownership', async () => {
    const {
      MTRL,
      accounts: [denis, admin, newAdmin],
    } = vars;

    // reverted when non-admin calls setTransfersAllowed
    await expect(MTRL.connect(denis.signer).transferOwnership(newAdmin.address)).to.be.revertedWith(
      'onlyAdmin: caller is not the owner'
    );

    // reverted when transfer ownership to invalid address
    await expect(MTRL.connect(admin.signer).transferOwnership(admin.address)).to.be.revertedWith(
      'transferOwnership: invalid admin'
    );
    await expect(
      MTRL.connect(admin.signer).transferOwnership(constants.AddressZero)
    ).to.be.revertedWith('transferOwnership: invalid admin');

    // success
    await MTRL.connect(admin.signer).transferOwnership(newAdmin.address);

    // revereted when try with old admin
    await expect(MTRL.connect(admin.signer).setTransfersAllowed(false)).to.be.revertedWith(
      'onlyAdmin: caller is not the owner'
    );

    // success with new admin
    await MTRL.connect(newAdmin.signer).setTransfersAllowed(false);
    expect(await MTRL.transfersAllowed()).to.be.false;
  });
});
