import { BigNumber, ethers, utils } from 'ethers';
import { ecsign } from 'ethereumjs-util';

import { IPermitApproveData, IAssetDetails } from './types';

const { keccak256, defaultAbiCoder, toUtf8Bytes, solidityPack } = utils;

const PERMIT_TYPEHASH = keccak256(
  toUtf8Bytes('Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)')
);

export async function signPermitMessage(
  privateKey: string,
  tokenDetails: IAssetDetails,
  approve: IPermitApproveData,
  nonce: number,
  deadline: number
): Promise<{ v: number; r: Buffer; s: Buffer }> {
  const DOMAIN_SEPARATOR = keccak256(
    defaultAbiCoder.encode(
      ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
      [
        keccak256(
          toUtf8Bytes(
            'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'
          )
        ),
        keccak256(toUtf8Bytes(tokenDetails.name)),
        keccak256(toUtf8Bytes(tokenDetails.version)),
        tokenDetails.chainId,
        tokenDetails.address,
      ]
    )
  );

  const structHash = keccak256(
    defaultAbiCoder.encode(
      ['bytes32', 'address', 'address', 'uint256', 'uint256', 'uint256'],
      [PERMIT_TYPEHASH, approve.owner, approve.spender, approve.value, nonce, deadline]
    )
  );

  const data = keccak256(
    solidityPack(
      ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
      [
        '0x19',
        '0x01',
        DOMAIN_SEPARATOR,
        keccak256(
          defaultAbiCoder.encode(
            ['bytes32', 'address', 'address', 'uint256', 'uint256', 'uint256'],
            [PERMIT_TYPEHASH, approve.owner, approve.spender, approve.value, nonce, deadline]
          )
        ),
      ]
    )
  );

  const { v, r, s } = ecsign(
    Buffer.from(data.slice(2), 'hex'),
    Buffer.from(privateKey.slice(2), 'hex')
  );

  return { v, r, s };
}
