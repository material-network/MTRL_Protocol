import { BigNumber, Signer } from 'ethers';

export enum ContractId {
  MTRL = 'MTRL',
  MTRLVesting = 'MTRLVesting',
}

export type EthereumAddress = string;

export interface IAssetDetails {
  name: string;
  address: EthereumAddress;
  chainId: number;
  version: string;
}

export interface IApproveMessageData {
  nonce: number;
  approve: boolean;
  user: EthereumAddress;
  contract: EthereumAddress;
}

export interface IPermitApproveData {
  owner: EthereumAddress;
  spender: EthereumAddress;
  value: BigNumber;
}

export interface IAccount {
  address: string;
  signer: Signer;
  privateKey: string;
}
