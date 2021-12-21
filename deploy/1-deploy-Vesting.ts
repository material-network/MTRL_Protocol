import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
const { ethers } = require('hardhat');

// deploy/1-deploy-MTRLVesting.ts
const deployMTRLVesting: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {
    deployments: { deploy, get },
    getNamedAccounts,
    getChainId,
  } = hre;
  const { deployer, admin, wallet } = await getNamedAccounts();
  const mtrl = await get('MTRL');

  const vestingStartBlock = await ethers.provider.getBlockNumber();
  const unlockCycle = 30 * 24 * 60 * 5;

  await deploy('MTRLVesting', {
    from: deployer,
    args: [mtrl.address, admin, wallet, vestingStartBlock, unlockCycle],
    log: true,
  });
};

export default deployMTRLVesting;
deployMTRLVesting.tags = ['MTRLVesting'];
