// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PredictToken
 * @dev ERC20 token used for prediction market transactions
 */
contract PredictToken is ERC20, Ownable {
    constructor(address initialOwner) ERC20("Predict Token", "PREDICT") Ownable(initialOwner) {
        // Mint initial supply to the owner (can be distributed later)
        _mint(initialOwner, 1000000 * 10**decimals()); // 1 million tokens
    }

    /**
     * @dev Mint tokens to a specific address (only owner)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}


