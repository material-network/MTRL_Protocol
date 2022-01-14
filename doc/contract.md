# MTRL Protcol contracts

## MTRL

Deployed_Addrss: https://etherscan.io/address/0x13c99770694f07279607a6274f28a28c33086424

## MTRLVesting

### deploy

When deploy, should set `mtrl token address`, `admin address`, `wallet address`, `vestingUnlockCyclePeriod`
Vesting start from blockNumber of contract_deployed_block + 1

- `mtrl token address`
- `admin address`: admin can transfer ownership and can set `wallet address`
- `wallet address`: this is the address that will receive unlocked tokens
- `vestingUnlockCyclePeriod`: blocks of cycle that tokens are unlocked, 30 * 24 * 60 * 4 = (1 month by assuming 4 blocks per minute)

### methods

#### setWallet(address newWallet)

- admin can only set new wallet address with this function

#### transferOwnership(addrss newAdmin)

- admin can only transfer ownership to others with this function

#### claim

- anyone can call this function to unlock 1M tokens per month and send them to the `wallet`
- first release will be available after vestingUnlockCyclePeriod blocks of deploy

1. the tx will be failed when

- vesting not started or 1 month is not passed yet from contract deploy
- vesting contract has not enough tokens.

2. this will withdraw together with unclaimed amount for the previous month too.
