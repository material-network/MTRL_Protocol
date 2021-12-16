import { deployments, ethers } from 'hardhat';
import { Contract } from 'ethers';
import { MTRL, MTRLVesting } from '../types';
import { ContractId } from './types';

export const deployContract = async <ContractType extends Contract>(
  contractName: string,
  args: any[],
  libraries?: {}
) => {
  const signers = await hre.ethers.getSigners();
  const contract = (await (
    await hre.ethers.getContractFactory(contractName, signers[0], {
      libraries: {
        ...libraries,
      },
    })
  ).deploy(...args)) as ContractType;

  return contract;
};

export const deployMTRL = async (admin: string) => {
  return await deployContract<MTRL>('MTRL', [admin]);
};

export const getMTRLDeployment = async (): Promise<MTRL> => {
  return (await ethers.getContractAt(
    ContractId.MTRL,
    (
      await deployments.get(ContractId.MTRL)
    ).address
  )) as MTRL;
};

export const getMTRLVestingDeployment = async (): Promise<MTRLVesting> => {
  return (await ethers.getContractAt(
    ContractId.MTRLVesting,
    (
      await deployments.get(ContractId.MTRLVesting)
    ).address
  )) as MTRLVesting;
};
