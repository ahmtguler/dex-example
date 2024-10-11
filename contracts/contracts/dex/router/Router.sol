// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IPool} from "../pool/IPool.sol";
import {IFeeManager} from "../../fee-manager/IFeeManager.sol";

contract Router is ReentrancyGuard {
    using SafeERC20 for IERC20;
    using SafeERC20 for IPool;

    IPool public immutable pool;
    IFeeManager public immutable feeManager;
    IERC20 public immutable TVER;
    IERC20 public immutable THB;

    constructor(
        IPool _pool,
        IFeeManager _feeManager,
        IERC20 _TVER,
        IERC20 _THB
    ) {
        pool = _pool;
        feeManager = _feeManager;
        TVER = _TVER;
        THB = _THB;
    }

    //todo add LP

    modifier validDeadline(uint256 deadline) {
        require(deadline >= block.timestamp, "Router: expired deadline");
        _;
    }


    /// @notice Add liquidity to the pool
    /// @param amountTVERDesired The amount of TVER tokens to add
    /// @param amountTHBDesired The amount of THB tokens to add
    /// @param amountTVERMin The minimum amount of TVER tokens to add
    /// @param amountTHBMin The minimum amount of THB tokens to add
    /// @param recipient The address to receive the LP tokens
    /// @param deadline The deadline to add liquidity
    /// @dev Caller sends amount of tokens they want to allocate to the pool
    /// router contract makes the calculations and use the optimal combination of 
    /// tokens to add to the pool
    function addLiquidity(
        uint256 amountTVERDesired,
        uint256 amountTHBDesired,
        uint256 amountTVERMin,
        uint256 amountTHBMin,
        address recipient,
        uint256 deadline
    ) external nonReentrant validDeadline(deadline) {
        IPool p = pool;
        (uint256 reserveTVER, uint256 reserveTHB) = p.getReserves();

        uint256 amountTVER;
        uint256 amountTHB;
        if (reserveTVER == 0 && reserveTHB == 0) {
            amountTVER = amountTVERDesired;
            amountTHB = amountTHBDesired;
        } else {
            uint256 amountTVEROptimal = quote(amountTHBDesired, reserveTHB, reserveTVER);
            if (amountTVEROptimal <= amountTVERDesired) {
                require(amountTVEROptimal >= amountTVERMin, "Router: insufficient TVER amount");
                amountTVER = amountTVEROptimal;
                amountTHB = amountTHBDesired;
            } else {
                uint256 amountTHBOptimal = quote(amountTVERDesired, reserveTVER, reserveTHB);
                assert(amountTHBOptimal <= amountTHBDesired);
                require(amountTHBOptimal >= amountTHBMin, "Router: insufficient THB amount");
                amountTVER = amountTVERDesired;
                amountTHB = amountTHBOptimal;
            }
        }

        TVER.safeTransferFrom(msg.sender, address(p), amountTVER);
        THB.safeTransferFrom(msg.sender, address(p), amountTHB);
        p.mint(recipient);
    }
    
    /// @notice Remove liquidity from the pool
    /// @param liquidityAmount The amount of LP tokens to remove
    /// @param amountTVERMin The minimum amount of TVER tokens to receive
    /// @param amountTHBMin The minimum amount of THB tokens to receive
    /// @param recipient The address to receive the tokens
    /// @param deadline The deadline to remove liquidity
    /// @dev Caller sends the amount of LP tokens to the pool and calls burn function
    /// to remove the liquidity and get underlying tokens in return
    function removeLiquidity(
        uint256 liquidityAmount,
        uint256 amountTVERMin,
        uint256 amountTHBMin,
        address recipient,
        uint256 deadline
    ) external nonReentrant validDeadline(deadline) {
        require(liquidityAmount > 0, "Router: insufficient liquidity amount");
        IPool p = pool;
        p.safeTransferFrom(msg.sender, address(p), liquidityAmount);
        (uint256 amountTVER, uint256 amountTHB) = p.burn(recipient);
        require(amountTVER >= amountTVERMin, "Router: insufficient TVER amount");
        require(amountTHB >= amountTHBMin, "Router: insufficient THB amount");
    }

    /// @notice Swap Exact Tokens
    /// @param amountIn The amount of tokens to swap
    /// @param amountOutMin The minimum amount of tokens to receive
    /// @param direction The direction of the swap (0 for TVER -> THB, 1 for THB -> TVER)
    /// @param recipient The address to receive the tokens
    /// @param deadline The deadline to swap tokens
    /// @dev Similar to most used swap function on UniSwapV2 router slightly modified
    function swapExactTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        uint8 direction,
        address recipient,
        uint256 deadline
    ) external nonReentrant validDeadline(deadline) {
        IPool p = pool;
        (uint256 reserveTVER, uint256 reserveTHB) = p.getReserves();
        require(amountIn > 0, "Router: insufficient amount");
        require(reserveTVER > 0 && reserveTHB > 0, "Router: insufficient liquidity");

        if (direction == 0) { // TVER -> THB
            uint256 amountOut = getAmountOut(amountIn, reserveTVER, reserveTHB);
            require(amountOut >= amountOutMin, "Router: insufficient output amount");
            TVER.safeTransferFrom(msg.sender, address(p), amountIn);
            p.swap(0, amountOut, recipient);
        } else { // THB -> TVER
            uint256 amountOut = getAmountOut(amountIn, reserveTHB, reserveTVER);
            require(amountOut >= amountOutMin, "Router: insufficient output amount");
            THB.safeTransferFrom(msg.sender, address(p), amountIn);
            p.swap(amountOut, 0, recipient);
        }
    }

    function quote(uint256 amountA, uint256 reserveA, uint256 reserveB) private pure returns (uint256) {
        require(amountA > 0, 'Router: insufficient amount');
        require(reserveA > 0 && reserveB > 0, 'Router: insufficient liquidity');
        uint256 amountB = (amountA * reserveB) / reserveA;
        return amountB;
    }

    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) private view returns (uint256) {
        require(amountIn > 0, 'Router: insufficient amount');
        require(reserveIn > 0 && reserveOut > 0, 'Router: insufficient liquidity');
        (,, uint16 totalFee) = feeManager.getFees();
        uint256 amountInWithFee = amountIn * (10_000 - totalFee);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 10_000) + amountInWithFee;
        return (numerator / denominator);
    }
}