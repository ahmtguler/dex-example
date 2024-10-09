// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.27;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IFeeManager} from "./IFeeManager.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract FeeManager is IFeeManager, Ownable {
    using SafeERC20 for IERC20;

    uint16 public liquditiyProviderFee;
    uint16 public platformFee;

    constructor(
        uint16 _liquditiyProviderFee,
        uint16 _platformFee,
        address _governor
    ) Ownable(_governor) {
        liquditiyProviderFee = _liquditiyProviderFee;
        platformFee = _platformFee;

    }

    function getFees() external view returns (uint16, uint16) {
        return (liquditiyProviderFee, platformFee);
    }

    function getTotalFee() external view returns (uint16) {
        return liquditiyProviderFee + platformFee;
    }

    function setFees(uint16 _liquditiyProviderFee, uint16 _platformFee) external onlyOwner {
        require(_liquditiyProviderFee + _platformFee <= 500, "FeeManager: fees too high");
        liquditiyProviderFee = _liquditiyProviderFee;
        platformFee = _platformFee;
    }

    function transferETH(address payable to, uint256 amount) external onlyOwner {
        to.transfer(amount);
    }

    function transferERC20(address token, address to, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(to, amount);
    }
}