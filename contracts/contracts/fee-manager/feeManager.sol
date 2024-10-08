// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.27;

// todo add governance functionality

import {IFeeManager} from "./IFeeManager.sol";

contract FeeManager is IFeeManager {
    uint16 fee;

    constructor(uint16 _fee) {
        fee = _fee;
    }

    function getFee() external view returns (uint16) {
        return fee;
    }

    function setFee(uint16 _fee) external {
        require(_fee <= 500, "FeeManager: fee too high");
        fee = _fee;
    }
}