# MTRL_ERC20

## Instructions for local test

- `npx hardhat compile`
- `npx hardhat test`

## Deploy instructions

1. deploy to kovan network
   `npx hardhat deploy --network kovan`

2. verify contract using etherscan
   `npx hardhat verify --network kovan DEPLOYED_CONTRACT_ADDRESS "Constructor argument 1"`
