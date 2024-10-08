// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.27;

interface IPool {
    function getReserves() external view returns (uint256, uint256);
    function mint(address to) external returns (uint256);
    function burn(address to) external returns (uint256, uint256);
    function swap(uint256 amountTVEROut, uint256 amountTHBOut, address to) external;



}