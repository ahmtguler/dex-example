// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IPool is IERC20 {
    function getReserves() external view returns (uint256, uint256);
    function mint(address recipient) external returns (uint256 liquidity);
    function burn(address recipient) external returns (uint256 amountTVER, uint256 amountTHB);
    function swap(uint256 amountTVEROut, uint256 amountTHBOut, address recipient) external;



}