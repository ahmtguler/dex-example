// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

contract LiquidityPool is ReentrancyGuard, ERC20 {
    using SafeERC20 for IERC20;
    using Math for uint256;

    uint256 private constant MINIMUM_LIQUIDITY = 10 ** 3;

    IERC20 public tokenA;
    IERC20 public tokenB;

    uint256 public reserveA; // takes up single storage slot combined with reserveB
    uint256 public reserveB;

    uint256 fee = 3; // 0.3% fee // todo add to governance token utility to be uptaded

    event Mint(address indexed to, uint256 amountA, uint256 amountB);
    event Burn(address indexed to, uint256 amountA, uint256 amountB);
    event Swap(
        address indexed sender,
        uint256 amountAIn,
        uint256 amountBIn,
        uint256 amountAOut,
        uint256 amountBOut
    );

    constructor(IERC20 _tokenA, IERC20 _tokenB) ERC20("LP Token", "LPT") {
        tokenA = _tokenA;
        tokenB = _tokenB;
    }

    function mint(
        address to
    ) external nonReentrant returns (uint256 liquidity) {
        uint256 _reserveA = reserveA; // Gas saving, prevents repeated use of SLOAD
        uint256 _reserveB = reserveB; // Gas saving, prevents repeated use of SLOAD
        uint256 balanceA = tokenA.balanceOf(address(this)); // Gas saving, prevents repeated use of SLOAD
        uint256 balanceB = tokenB.balanceOf(address(this)); // Gas saving, prevents repeated use of SLOAD

        uint256 amountA = balanceA > _reserveA ? balanceA - _reserveA : 0;
        uint256 amountB = balanceB > _reserveB ? balanceB - _reserveB : 0;

        uint256 totalSupply = totalSupply(); //Gas saving, prevents repeated use of SLOAD

        if (totalSupply == 0) {
            liquidity = Math.sqrt(amountA * amountB) - MINIMUM_LIQUIDITY;
            _mint(address(0), MINIMUM_LIQUIDITY); // makes sure no one can hold 100% of the pool and gatekeep it by manupulating token balances
        } else {
            liquidity = Math.min(
                (amountA * totalSupply) / _reserveA,
                (amountB * totalSupply) / _reserveB
            );
            _mint(to, liquidity);
        }
        require(liquidity > 0, "Liquidity amount must be greater than 0");

        _updateReserves(balanceA, balanceB);

        emit Mint(to, amountA, amountB);
    }

    function burn(
        address to
    ) external nonReentrant returns (uint256 amountA, uint256 amountB) {
        IERC20 _tokenA = tokenA; // Gas saving, prevents repeated use of SLOAD
        IERC20 _tokenB = tokenB; // Gas saving, prevents repeated use of SLOAD
        uint256 balanceA = _tokenA.balanceOf(address(this)); // Gas saving, prevents repeated use of SLOAD
        uint256 balanceB = _tokenB.balanceOf(address(this)); // Gas saving, prevents repeated use of SLOAD
        uint256 liquidity = balanceOf(address(this)); // Gas saving, prevents repeated use of SLOAD

        uint256 _totalSupply = totalSupply(); // Gas saving, prevents repeated use of SLOAD

        amountA = (liquidity * balanceA) / _totalSupply;
        amountB = (liquidity * balanceB) / _totalSupply;
        require(amountA > 0 && amountB > 0, "Amounts must be greater than 0");

        _burn(address(this), liquidity);

        _tokenA.safeTransfer(to, amountA);
        _tokenB.safeTransfer(to, amountB);

        balanceA = _tokenA.balanceOf(address(this)); // Update balanceA after transfer token transfers
        balanceB = _tokenB.balanceOf(address(this)); // Update balanceB after token transfers

        _updateReserves(balanceA, balanceB);

        emit Burn(to, amountA, amountB);
    }

    function swap(
        uint256 amountAOut,
        uint256 amountBOut,
        address to
    ) external nonReentrant {
        require(amountAOut > 0 || amountBOut > 0, "Both amounts cannot be 0");
        uint256 _reserveA = reserveA; // Gas saving, prevents repeated use of SLOAD
        uint256 _reserveB = reserveB; // Gas saving, prevents repeated use of SLOAD
        require(
            amountAOut < _reserveA && amountBOut < _reserveB,
            "Insufficient liquidity"
        );

        IERC20 _tokenA = tokenA; // Gas saving, prevents repeated use of SLOAD
        IERC20 _tokenB = tokenB; // Gas saving, prevents repeated use of SLOAD

        require(
            to != address(_tokenA) && to != address(_tokenB),
            "Invalid recipient"
        );
        if (amountAOut > 0) {
            _tokenA.safeTransfer(to, amountAOut);
        }
        if (amountBOut > 0) {
            _tokenB.safeTransfer(to, amountBOut);
        }
        uint256 balanceA = _tokenA.balanceOf(address(this)); // Gas saving, prevents repeated use of SLOAD
        uint256 balanceB = _tokenB.balanceOf(address(this)); // Gas saving, prevents repeated use of SLOAD

        uint256 amountAIn = balanceA > _reserveA - amountAOut
            ? balanceA - (_reserveA - amountAOut)
            : 0;
        uint256 amountBIn = balanceB > _reserveB - amountBOut
            ? balanceB - (_reserveB - amountBOut)
            : 0;
        require(amountAIn > 0 || amountBIn > 0, "Insufficient input amount");

        uint256 _fee = fee;
        uint256 balanceAAdjusted = (balanceA * 1000) - (amountAIn * _fee);
        uint256 balanceBAdjusted = (balanceB * 1000) - (amountBIn * _fee);
        //todo fee management for protocol fees will be added here

        require(
            balanceAAdjusted * balanceBAdjusted >=
                uint256(_reserveA) * _reserveB * 1000 ** 2,
            "K invariant not maintained"
        );

        _updateReserves(balanceA, balanceB);

        emit Swap(msg.sender, amountAIn, amountBIn, amountAOut, amountBOut);
    }

    function skim(address to) external nonReentrant {
        IERC20 _tokenA = tokenA; // Gas saving, prevents repeated use of SLOAD
        IERC20 _tokenB = tokenB; // Gas saving, prevents repeated use of SLOAD

        _tokenA.safeTransfer(to, _tokenA.balanceOf(address(this)) - reserveA);
        _tokenB.safeTransfer(to, _tokenB.balanceOf(address(this)) - reserveB);
    }

    function sync() external nonReentrant {
        _updateReserves(
            tokenA.balanceOf(address(this)),
            tokenB.balanceOf(address(this))
        );
    }

    function _updateReserves(uint256 _balanceA, uint256 _balanceB) internal {
        reserveA = uint128(_balanceA);
        reserveB = uint128(_balanceB);
    }
}
