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

    uint256 private constant MINIMUM_LIQUIDITY = 10**3;

    IERC20 public tokenA;
    IERC20 public tokenB;

    uint256 public reserveA;
    uint256 public reserveB;

    event Mint(address indexed to, uint256 amountA, uint256 amountB);
    event Burn(address indexed to, uint256 amountA, uint256 amountB);
    event Swap(address indexed sender, uint256 amountAIn, uint256 amountBOut);

    constructor(IERC20 _tokenA, IERC20 _tokenB) ERC20("LP Token", "LPT") {
        tokenA = _tokenA;
        tokenB = _tokenB;
    }

    function mint(address to) external nonReentrant returns (uint256 liquidity) {
        uint256 _reserveA = tokenA.balanceOf(address(this));
        uint256 _reserveB = tokenB.balanceOf(address(this));
        uint256 _balanceA = tokenA.balanceOf(address(this));
        uint256 _balanceB = tokenB.balanceOf(address(this));

        uint256 _amountA = _balanceA > _reserveA ? _balanceA - _reserveA : 0;
        uint256 _amountB = _balanceB > _reserveB ? _balanceB - _reserveB : 0;

        //todo fee calculation to be added

        uint256 _totalSupply = totalSupply();

        if (totalSupply() == 0) {
            liquidity = Math.sqrt(_amountA * _amountB) - MINIMUM_LIQUIDITY;
            _mint(address(0), MINIMUM_LIQUIDITY); // makes sure no one can hold 100% of the pool
        } else {
            liquidity = Math.min((_amountA * _totalSupply) / _reserveA, (_amountB * _totalSupply) / _reserveB);
            _mint(to, liquidity);
        }
        require(liquidity > 0, "Liquidity amount must be greater than 0");

        _updateReserves(_balanceA, _balanceB);

        // todo update last state based on fee

        emit Mint(to, _amountA, _amountB);
    }

    function burn(address to) external nonReentrant returns (uint256 amountA, uint256 amountB) {
        uint256 _reserveA = reserveA;
        uint256 _reserveB = reserveB;
        uint256 _balanceA = tokenA.balanceOf(address(this));
        uint256 _balanceB = tokenB.balanceOf(address(this));
        uint256 _liquidity = balanceOf(address(this));

        //todo fee calculation to be added

        uint256 _totalSupply = totalSupply();

        amountA = (_liquidity * _balanceA) / _totalSupply;
        amountB = (_liquidity * _balanceB) / _totalSupply;
        require(amountA > 0 && amountB > 0, "Amounts must be greater than 0");

        _burn(address(this), _liquidity);

        tokenA.safeTransfer(to, amountA);
        tokenB.safeTransfer(to, amountB);

        _updateReserves(_balanceA, _balanceB);

        // todo update last state based on fee

        emit Burn(to, amountA, amountB);
    }

    function _updateReserves(uint256 _balanceA, uint256 _balanceB) internal {
        reserveA = _balanceA;
        reserveB = _balanceB;
    }
}