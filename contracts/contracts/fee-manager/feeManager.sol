// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.27;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IFeeManager} from "./IFeeManager.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract FeeManager is IFeeManager, Ownable {
    using SafeERC20 for IERC20;

    uint16 private _liquditiyProviderFee;
    uint16 private _platformFee;

    constructor(
        uint16 liquditiyProviderFee,
        uint16 platformFee,
        address _governor
    ) Ownable(_governor) {
        _liquditiyProviderFee = liquditiyProviderFee;
        _platformFee = platformFee;
    }

    function getFees() external view returns (uint16 liquditiyProviderFee, uint16 platformFee, uint16 totalFee) {
        return (_liquditiyProviderFee, _platformFee, _liquditiyProviderFee + _platformFee);
    }

    function setFees(uint16 liquditiyProviderFee, uint16 platformFee) external onlyOwner {
        require(liquditiyProviderFee + platformFee <= 5000, "FeeManager: fees too high");
        _liquditiyProviderFee = liquditiyProviderFee;
        _platformFee = platformFee;
    }

    function transferETH(address payable to, uint256 amount) external onlyOwner {
        to.transfer(amount);
    }

    function transferERC20(address token, address to, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(to, amount);
    }
}