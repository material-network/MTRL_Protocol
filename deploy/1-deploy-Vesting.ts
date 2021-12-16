import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
const { ethers } = require('hardhat');

import {
  UNLOCK_CYCLE_MAIN_NET,
  UNLOCK_CYCLE_TEST_NNET,
  START_VESTING_AFTER_BLOCKS,
} from '../helpers/constants';

// deploy/1-deploy-MTRLVesting.ts
const deployMTRLVesting: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {
    deployments: { deploy, get },
    getNamedAccounts,
    getChainId,
  } = hre;
  const { deployer, admin, wallet } = await getNamedAccounts();
  const chainId = await getChainId();

  const mtrl = await get('MTRL');
  const currentBlockNumber = await ethers.provider.getBlockNumber();
  const vestingStartBlock = currentBlockNumber + START_VESTING_AFTER_BLOCKS;

  let unlockCycle;
  if (chainId === '1') {
    // mainnet
    unlockCycle = UNLOCK_CYCLE_MAIN_NET;
  } else {
    unlockCycle = UNLOCK_CYCLE_TEST_NNET;
  }

  await deploy('MTRLVesting', {
    from: deployer,
    args: [mtrl.address, admin, wallet, vestingStartBlock, unlockCycle],
    log: true,
  });
};

export default deployMTRLVesting;
deployMTRLVesting.tags = ['MTRLVesting'];
