// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Bank is ERC20 {
    constructor() ERC20("EarthSaver", "ESV") {
        _mint(msg.sender, 100000 * 10 ** decimals());
    }

    function depositMoney(uint256 amount) public {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        _burn(msg.sender, amount);
    }

    function withdrawMoney(uint256 amount) public {
        _mint(msg.sender, amount);
    }

    function transferMoney(address recipient, uint256 amount) public {
        _transfer(msg.sender, recipient, amount);
    }
}
