import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import deployParameters from '../helpers/constants';
import { getMTRLDeployment } from '../helpers/contract';

// deploy/1-deploy-MTRLVesting.ts
const deployMTRLVesting: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {
    deployments: { deploy, get },
    getNamedAccounts,
    getChainId,
  } = hre;
  const currentDeployParameters = deployParameters[hre.network.name];

  const { deployer, admin, wallet } = await getNamedAccounts();
  const MTRL = await getMTRLDeployment(currentDeployParameters.MTRL);

  // 15 second per one block, 4 blocks per minute
  const unlockCycle = 30 * 24 * 60 * 4; // every 1 month

  await deploy('MTRLVesting', {
    from: deployer,
    args: [MTRL.address, admin, wallet, unlockCycle],
    log: true,
  });
};

export default deployMTRLVesting;
deployMTRLVesting.tags = ['MTRLVesting'];
