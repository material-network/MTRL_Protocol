import { deployments, ethers, getNamedAccounts } from 'hardhat';
import { Signer, Wallet } from 'ethers';
import { assert } from 'chai';

import { MTRL } from '../types';
import { EthereumAddress } from '../helpers/types';
import { getMTRLDeployment } from '../helpers/contract';
import { expandToDecimals } from '../helpers/utils';

export interface IAccount {
  address: EthereumAddress;
  signer: Signer;
  privateKey: string;
}

export interface TestVars {
  MTRL: MTRL;
  accounts: IAccount[];
  admin: IAccount;
}

const testVars: TestVars = {
  MTRL: {} as MTRL,
  accounts: {} as IAccount[],
  admin: {} as IAccount,
};

export const userBalance = expandToDecimals(10, 18);
export const totalSupply = expandToDecimals(100000000, 18);

const setupTestEnv = async (vars: TestVars) => {
  const { accounts, admin } = vars;
  const MTRL = await getMTRLDeployment();

  // mint totalSupply / 2 tokens to admin
  await MTRL.connect(admin.signer).mint(admin.address, totalSupply.div(2));

  // sent userBalance tokens to all users
  for (let i = 0; i < accounts.length; i++) {
    if (accounts[i].address !== admin.address) {
      await MTRL.connect(admin.signer).transfer(accounts[i].address, userBalance);
    }
  }

  return { MTRL };
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
