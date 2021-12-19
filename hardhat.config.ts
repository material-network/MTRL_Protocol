import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-etherscan';
import 'hardhat-deploy';
import 'hardhat-contract-sizer';
import 'hardhat-gas-reporter';
import 'solidity-coverage';

import { HardhatUserConfig } from 'hardhat/types';
import { task } from 'hardhat/config';

require('dotenv').config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
export default {
  solidity: '0.8.4',
  settings: {
    optimizer: {
      enabled: true,
      runs: 500,
    },
  },
  typechain: {
    outDir: 'types/',
    target: 'ethers-v5',
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  namedAccounts: {
    deployer: {
      default: 0,
      kovan: '0xabB6D4a1015e291b1bc71e7e56ff2c9204665b07',
      mainnet: '0xabB6D4a1015e291b1bc71e7e56ff2c9204665b07',
    },
    admin: {
      default: 1,
      kovan: '0xabB6D4a1015e291b1bc71e7e56ff2c9204665b07',
      mainnet: '0xabB6D4a1015e291b1bc71e7e56ff2c9204665b07',
      // KP: 0xeeE072318D1B93BCfEB1611BB8C8978a772b75dA
    },
    wallet: {
      default: 2,
      kovan: '0xabB6D4a1015e291b1bc71e7e56ff2c9204665b07',
      mainnet: '0xabB6D4a1015e291b1bc71e7e56ff2c9204665b07',
    },
  },
  gasReporter: {
    currency: 'USD',
    gasPrice: 110,
  },
  mocha: {
    timeout: 200000,
  },
  networks: {
    kovan: {
      url: process.env.KOVAN_PROVIDER_URL as string,
      accounts: [process.env.PRIVATE_KEY],
    },
    mainnet: {
      url: process.env.MAINNET_PROVIDER_URL as string,
      accounts: [process.env.PRIVATE_KEY],
      saveDeployments: true,
      gas: 2400000,
      gasPrice: 100 * 1000000000,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERESCAN_API,
  },
} as HardhatUserConfig;
