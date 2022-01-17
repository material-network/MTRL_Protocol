interface IDeployParameters {
  [key: string]: any;
}

export default Object.freeze({
  mainnet: {
    MTRL: '0x13c99770694f07279607a6274f28a28c33086424',
    MTRLVesting: '0x8071Db05f6f3D78C31b2a157348D866B4B9339fe',
  },
  kovan: {
    MTRL: '0x61cb987c1c87bd3cea79970e1f20cbc7f91dc1ab',
    MTRLVesting: '0x3bfca24b2be7c5703b8d3912ecd7a4db2686b714',
  },
  hardhat: {
    MTRL: undefined,
    MTRLVesting: undefined,
  },
}) as IDeployParameters;
