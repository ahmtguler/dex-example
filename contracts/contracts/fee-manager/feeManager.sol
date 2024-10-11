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

    ///@notice Can only be called by Governor contract to set the fees. It has another
    /// security mechanism to prevents fees from being too high in case of a malicious
    /// governor contract actions.
    ///@param liquditiyProviderFee The fee that will be allocated to the liquidity pool token holders
    ///@param platformFee The fee that will be allocated to the platform and send to the fee manager
    function setFees(uint16 liquditiyProviderFee, uint16 platformFee) external onlyOwner {
        require(liquditiyProviderFee + platformFee <= 500, "FeeManager: fees too high");
        _liquditiyProviderFee = liquditiyProviderFee;
        _platformFee = platformFee;
    }

    ///@notice Transfer ETH to an address can only be called by the Governor contract
    ///@param to The address to transfer the ETH to
    ///@param amount The amount of ETH to transfer
    function transferETH(address payable to, uint256 amount) external onlyOwner {
        to.transfer(amount);
    }

    ///@notice Transfer ERC20 token to an address can only be called by the Governor contract
    ///@param token The address of the ERC20 token
    ///@param to The address to transfer the ERC20 token to
    ///@param amount The amount of ERC20 token to transfer
    function transferERC20(address token, address to, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(to, amount);
    }
}