import { deployments, ethers, getNamedAccounts, network } from 'hardhat';
import { Signer, Wallet } from 'ethers';
import { assert } from 'chai';

import { MTRL, MTRLVesting } from '../types';
import { EthereumAddress } from '../helpers/types';
import { getMTRLDeployment, deployMTRLVesting } from '../helpers/contract';
import { expandToDecimals } from '../helpers/utils';

export interface IAccount {
  address: EthereumAddress;
  signer: Signer;
  privateKey: string;
}

export interface TestVars {
  MTRL: MTRL;
  MTRLVesting: MTRLVesting;
  accounts: IAccount[];
  admin: IAccount;
  blocksTilVestingStart: number;
  vestingUnlockCycle: number;
}

const testVars: TestVars = {
  MTRL: {} as MTRL,
  MTRLVesting: {} as MTRLVesting,
  accounts: {} as IAccount[],
  admin: {} as IAccount,
  blocksTilVestingStart: {} as number,
  vestingUnlockCycle: {} as number,
};

export const userBalance = expandToDecimals(10, 18);
export const totalSupply = expandToDecimals(100000000, 18);
export const VestingAmount = expandToDecimals(18000000, 18);

const setupTestEnv = async (vars: TestVars) => {
  const { accounts, admin } = vars;

  const MTRL = await getMTRLDeployment();

  // sent userBalance tokens to all users
  for (let i = 0; i < accounts.length; i++) {
    if (accounts[i].address !== admin.address) {
      await MTRL.connect(admin.signer).transfer(accounts[i].address, userBalance);
    }
  }

  // setup MTRLVesting
  const [deployer, vestingAdmin, vestingWallet] = accounts;
  const vestingUnlockCycle = 60 * 5; // 1 hour for testnet

  const MTRLVesting = await deployMTRLVesting(
    MTRL.address,
    vestingAdmin.address,
    vestingWallet.address,
    vestingUnlockCycle
  );

  return { MTRL, MTRLVesting, vestingUnlockCycle };
};

export function runTestSuite(title: string, tests: (arg: TestVars) => void) {
  describe(title, function () {
    before(async () => {
      // we manually derive the signers address using the mnemonic
      // defined in the hardhat config
      const mnemonic = 'test test test test test test test test test test test junk';

      testVars.accounts = await Promise.all(
        (
          await ethers.getSigners()
        ).map(async (signer, index) => ({
          address: await signer.getAddress(),
          signer,
          privateKey: ethers.Wallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/${index}`).privateKey,
        }))
      );
      assert.equal(
        new Wallet(testVars.accounts[0].privateKey).address,
        testVars.accounts[0].address,
        'invalid mnemonic or address'
      );

      const { admin } = await getNamedAccounts();
      // address used in performing admin actions in InterestRateModel
      testVars.admin = testVars.accounts.find(
        (x) => x.address.toLowerCase() === admin.toLowerCase()
      ) as IAccount;
    });

    beforeEach(async () => {
      const setupDeployedContracts = deployments.createFixture(
        async ({ deployments, getNamedAccounts, ethers }, options) => {
          await deployments.fixture(); // ensure you start from a fresh deployments
        }
      );

      await setupDeployedContracts();
      const vars = await setupTestEnv(testVars);
      Object.assign(testVars, vars);
    });

    tests(testVars);
  });
}

export const timeTravel = async (seconds: number) => {
  await network.provider.send('evm_increaseTime', [seconds]);
  await network.provider.send('evm_mine', []);
};

export const advanceBlock = async () => {
  await ethers.provider.send('evm_mine', []);
};

export const advanceBlocks = async (blocks: number) => {
  for (let i = 0; i < blocks; i++) {
    await advanceBlock();
  }
};
