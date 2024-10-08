// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IPool} from "../pair/IPool.sol";

contract Router is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IPool public pool;
    IERC20 public TVER;
    IERC20 public THB;

    constructor(IPool _pool) {
        pool = _pool;
    }

    //todo add LP

    modifier validDeadline(uint256 deadline) {
        require(deadline >= block.timestamp, "Router: expired deadline");
        _;
    }

    function addTVERTHBLiquidity(
        uint256 amountTVERDesired,
        uint256 amountTHBDesired,
        uint256 amountTVERMin,
        uint256 amountTHBMin,
        address to,
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
        p.mint(to);
    }
    

    //todo remove LP

    //todo swap 

    //todo quote

    function quote(uint256 amountA, uint256 reserveA, uint256 reserveB) internal pure returns (uint256) {
        require(amountA > 0, 'Router: insufficient amount');
        require(reserveA > 0 && reserveB > 0, 'Router: insufficient liquidity');
        uint256 amountB = (amountA * reserveB) / reserveA;
        return amountB;
    }

    //todo getAmountOut
}