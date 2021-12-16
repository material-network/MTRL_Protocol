//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract MTRLVesting {
    /// @notice blockNumber that vesting will start
    uint256 vestingStartBlock;

    /// @notice tokens will be unlocked per this cycle
    uint256 public immutable UNLOCK_CYCLE;

    /// @notice amount of tokens that will be unlocked per month
    uint256 public constant UNLOCK_AMOUNT = 1000000e18; // 1M

    /// @notice admin
    address public admin;

    /// @notice address that will receive unlocked tokens
    address public wallet;

    /// @notice MTRL token
    IERC20 public mtrl;

    /// @notice true when nth month is unlocked
    mapping(uint256 => bool) public isUnlocked;

    constructor(
        IERC20 _mtrl,
        address _admin,
        address _wallet,
        uint256 _vestingStartBlock,
        uint256 _unlockCycl
    ) {
        require(_vestingStartBlock != 0, 'constructor: invalid vesting start block');
        require(address(_mtrl) != address(0), 'constructor: invalid MTRL');
        require(_admin != address(0), 'constructor: invalid admin');
        require(_wallet != address(0), 'constructor: invalid wallet');

        admin = _admin;
        mtrl = _mtrl;
        vestingStartBlock = _vestingStartBlock;
        UNLOCK_CYCLE = _unlockCycl;
        wallet = _wallet;
    }

    modifier onlyAdmin() {
        require(admin == msg.sender, 'onlyAdmin: caller is not the owner');
        _;
    }

    event SETWALLET(address indexed _newWallet);
    event CLAIMED(uint256 indexed _amount, uint256 indexed _index, address _wallet);

    /// @dev transfer ownership
    function transferOwnership(address _newAdmin) external onlyAdmin {
        require(admin != _newAdmin && _newAdmin != address(0), 'transferOwnership: invalid admin');
        admin = _newAdmin;
    }

    /// @dev setWallet
    /// @param _newWallet new address of wallet that will receive unlocked tokens
    function setWallet(address _newWallet) external onlyAdmin {
        require(_newWallet != address(0) && _newWallet != wallet, 'setWallet: invalid wallet');
        wallet = _newWallet;
        emit SETWALLET(_newWallet);
    }

    /// @dev anyone can call this function to transfer unlocked tokens to the wallet
    function claim() external {
        require(block.number >= vestingStartBlock, 'claim: vesting not started');

        uint256 vestingBalance = mtrl.balanceOf(address(this));
        require(vestingBalance > 0, 'claim: no MTRL tokens');

        // record claiming month index
        uint256 index;
        if (block.number - vestingStartBlock < UNLOCK_CYCLE) {
            index = 1;
        } else {
            index = (block.number - vestingStartBlock) / UNLOCK_CYCLE + 1;
        }

        uint256 transferAmount;
        if (!isUnlocked[index]) {
            transferAmount = vestingBalance < UNLOCK_AMOUNT
                ? mtrl.balanceOf(address(this))
                : UNLOCK_AMOUNT;
            isUnlocked[index] = true;

            mtrl.transfer(wallet, transferAmount);
        }

        emit CLAIMED(transferAmount, index, wallet);
    }
}
