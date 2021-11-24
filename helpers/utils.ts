import { BigNumber } from 'ethers';
const hre = require('hardhat');

import { signPermitMessage } from './message';
import { IAccount } from './types';
import { MTRL } from '../types';

export const expandToDecimals = (n: number, deicmal: number): BigNumber => {
  return BigNumber.from(n).mul(BigNumber.from(10).pow(deicmal));
};

export const permit = async (token: MTRL, from: IAccount, to: IAccount, amount: BigNumber) => {
  const tokenDetails = {
    name: await token.name(),
    version: '1',
    address: token.address,
    chainId: (await hre.ethers.provider.getNetwork()).chainId,
  };

  const deadline = (await (await hre.ethers.provider.getBlock('latest')).timestamp) + 200000;
  const nonce = await (await token.nonces(from.address)).toNumber();

  const { v, r, s } = await signPermitMessage(
    from.privateKey,
    tokenDetails,
    {
      owner: from.address,
      spender: to.address,
      value: amount,
    },
    nonce,
    deadline
  );

  return await token
    .connect(from.signer)
    .permit(from.address, to.address, amount, deadline, v, r, s);
};
