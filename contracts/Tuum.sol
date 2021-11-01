//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import './external/ERC20.sol';

contract Tuum is ERC20 {
    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) {}
}
