# MTRL Protcol contracts

## MTRL

Deployed_Addrss: https://etherscan.io/address/0x13c99770694f07279607a6274f28a28c33086424

## MTRLVesting

### deploy

When deploy, should set `mtrl token address`, `admin address`, `wallet address`, `vestingStartBlock`, `vestingUnlockCyclePeriod`

- `mtrl token address`
- `admin address`: admin can transfer ownership and can set `wallet address`
- `wallet address`: this is the address that will receive unlocked tokens
- `vestingStartBlock`: block number that vesting will start
- `vestingUnlockCyclePeriod`: blocks of cycle that tokens are unlocked (should be 1 month on mainnet)

### methods

#### setWallet(address newWallet)

- admin can only set new wallet address with this function

#### transferOwnership(addrss newAdmin)

- admin can only transfer ownership to others with this function

#### claim

- anyone can call this function to unlock 1M tokens per month and send them to the `wallet`
- first release will be available at `vestingStartBlock + vestingUnlockCyclePeriod` block

1. the tx will be failed when

- vesting not started.
- vesting contract has not enough tokens.

2. when this funciton is called multiple times in one cycle, only first will work.
