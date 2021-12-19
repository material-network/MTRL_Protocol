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
  const chainId = await getChainId();

  const mtrl = await get('MTRL');

  let unlockCycle = 2 * 24 * 60 * 5; // 2 days
  let vestingStartBlock = (await ethers.provider.getBlockNumber()) + 60 * 5; // after 1 hour (5 blocks per min)
  console.log('===>vestingStartBlock', vestingStartBlock);

  if (chainId === '1') {
    // mainnet
    unlockCycle = 30 * 24 * 60 * 5; // 30 days
  }

  await deploy('MTRLVesting', {
    from: deployer,
    args: [mtrl.address, admin, wallet, vestingStartBlock, unlockCycle],
    log: true,
  });
};

export default deployMTRLVesting;
deployMTRLVesting.tags = ['MTRLVesting'];
