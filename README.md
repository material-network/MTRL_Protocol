# MTRL_ERC20

## Instructions for local test

- `npx hardhat compile`
- `npx hardhat test`

## Deploy instructions

1. deploy to kovan network
   `npx hardhat deploy --network kovan`

2. verify contract using etherscan
   `npx hardhat --network kovan verify --constructor-args arguments.js 0x8071Db05f6f3D78C31b2a157348D866B4B9339fe`
