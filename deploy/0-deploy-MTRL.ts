import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

// deploy/0-deploy-MTRL.ts
const deployMTRL: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {
    deployments: { deploy },
    getNamedAccounts,
  } = hre;
  const { deployer, admin } = await getNamedAccounts();

  await deploy('MTRL', {
    from: deployer,
    args: [admin],
    log: true,
  });
};

export default deployMTRL;
deployMTRL.tags = ['MTRL'];
