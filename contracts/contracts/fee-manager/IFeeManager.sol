// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.27;

interface IFeeManager {
    function getFee() external view returns (uint16);
    function setFee(uint16 _fee) external;
}