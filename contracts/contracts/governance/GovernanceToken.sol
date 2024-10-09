// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.27;

import {ERC20, ERC20Votes} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract GovernanceToken is ERC20Votes {
    constructor() ERC20("Governance Token", "GOV") EIP712("GovernanceToken", "1") {
        _mint(msg.sender, 1_000_000e18);
    }
}