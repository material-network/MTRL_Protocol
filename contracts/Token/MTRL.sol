//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol';

contract MTRL is ERC20, ERC20Permit {
    /// @dev admin that can manage minters and transfer
    address public admin;

    /// @dev addresses that have mint permissions
    mapping(address => bool) public canMint;

    /// @dev initial supply to be minted
    uint256 public constant TOTAL_SUPPLY = 100_000_000e18;

    /// @dev enable/disable token transfer
    bool public transfersAllowed = true;

    /// @dev Emitted when transfer toggle is switched
    event TransfersAllowed(bool transfersAllowed);

    constructor(address _admin) ERC20('Material', 'MTRL') ERC20Permit('Material') {
        require(_admin != address(0), 'constructor: invalid admin');
        admin = _admin;
    }

    modifier onlyAdmin() {
        require(admin == msg.sender, 'onlyAdmin: caller is not the owner');
        _;
    }

    /// @dev set admins that have permissions to mint
    function setMinter(address _addr, bool _mintable) external onlyAdmin {
        require(_addr != address(0), 'setMinters: _addr is invalid');
        canMint[_addr] = _mintable;
    }

    /// @dev only admins can mint new tokens
    function mint(address _account, uint256 _amount) external {
        require(canMint[msg.sender] || msg.sender == admin, 'mint: no permission to mint tokens');
        require(_account != address(0), 'mint: _addr is invalid');
        require(_amount > 0, 'mint: _amount is invalid');
        require(totalSupply() + _amount <= TOTAL_SUPPLY, 'mint: exceeds total supply');

        _mint(_account, _amount);
    }

    /// @dev Toggles transfer allowed flag.
    function setTransfersAllowed(bool _transfersAllowed) external onlyAdmin {
        transfersAllowed = _transfersAllowed;
        emit TransfersAllowed(transfersAllowed);
    }

    /// @dev disable/enable transfer with transfersAllowed
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        require(transfersAllowed, '_beforeTokenTransfer: transfer is disabled');
    }
}
