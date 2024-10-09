// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.27;

interface IFeeManager {
    function getFees() external view returns (uint16, uint16);
    function getTotalFee() external view returns (uint16);
}