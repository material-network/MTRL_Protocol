//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol';

contract MTRLVesting {
    /// @notice blockNumber that vesting will start
    uint256 vestingStartBlock;

    /// @notice blockNumber that unlocked at last
    uint256 lastUnlockedBlock;

    /// @notice tokens will be unlocked per this cycle
    uint256 public constant UNLOCK_CYCLE = 30 * 24 * 60 * 5; // 5 blocks per 1 min

    /// @notice amount of tokens that will be unlocked per month
    uint256 public constant UNLOCK_AMOUNT = 1000000e18;

    /// @notice admin
    address public admin;

    /// @notice address that will receive unlocked tokens
    address public wallet;

    /// @notice MTRL token
    IERC20 public mtrl;

    constructor(
        address _admin,
        IERC20 _mtrl,
        uint256 _vestingStartBlock
    ) {
        require(_vestingStartBlock != 0, 'constructor: invalid vesting start block');
        require(_admin != address(0), 'constructor: invalid admin');
        require(address(_mtrl) != address(0), 'constructor: invalid MTRL');

        admin = _admin;
        mtrl = _mtrl;
        vestingStartBlock = _vestingStartBlock;
    }

    modifier onlyAdmin() {
        require(admin == msg.sender, 'onlyAdmin: caller is not the owner');
        _;
    }

    event WALLETSET(address indexed _newWallet);
    event UNLOCKEDANDTRANSFERED(uint256 indexed _amount, uint256 indexed _block, address _wallet);

    /// @dev setWallet
    /// @param _newWallet new address of wallet that will receive unlocked tokens
    function setWallet(address _newWallet) external onlyAdmin {
        require(_newWallet != address(0) && _newWallet != wallet, 'setWallet: invalid wallet');
        wallet = _newWallet;
        emit WALLETSET(_newWallet);
    }

    /// @dev anyone can call this function to transfer unlocked tokens to the wallet
    function claim() external returns (bool) {
        require(block.number >= vestingStartBlock, 'claim: vesting not started');

        uint256 vestingBalance = mtrl.balanceOf(address(this));
        require(vestingBalance > 0, 'claim: no MTRL tokens');

        if (block.number >= lastUnlockedBlock) {
            uint256 transferAmount = UNLOCK_AMOUNT;
            if (vestingBalance < UNLOCK_AMOUNT) {
                transferAmount = mtrl.balanceOf(address(this));
            }

            lastUnlockedBlock += UNLOCK_CYCLE;
            mtrl.transfer(wallet, transferAmount);

            emit UNLOCKEDANDTRANSFERED(transferAmount, _block, wallet);
            return true;
        }

        return false;
    }
}
