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

console.log('===>KOVAN_PROVIDER_URLv', process.env.KOVAN_PROVIDER_URL);
console.log('===>PRIVATE_KEY', process.env.PRIVATE_KEY);
console.log('===>ETHERESCAN_API', process.env.ETHERESCAN_API);

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
    },
    admin: {
      default: 1,
      kovan: '0xabB6D4a1015e291b1bc71e7e56ff2c9204665b07',
    },
  },
  gasReporter: {
    currency: 'USD',
    gasPrice: 21,
  },
  networks: {
    kovan: {
      url: process.env.KOVAN_PROVIDER_URL as string,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERESCAN_API,
  },
} as HardhatUserConfig;
