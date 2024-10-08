// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {IPool} from "./IPool.sol";
import {IFeeManager} from "../../fee-manager/IFeeManager.sol";

contract LiquidityPool is ReentrancyGuard, ERC20, IPool {
    using SafeERC20 for IERC20;
    using Math for uint256;

    uint256 private constant MINIMUM_LIQUIDITY = 10 ** 3;

    IFeeManager public immutable FEE_MANAGER;
    IERC20 public immutable TVER;
    IERC20 public immutable THB;

    uint256 public reserveTVER; // takes up single storage slot combined with reserveTHB
    uint256 public reserveTHB;

    event Mint(address indexed recipient, uint256 amountTVER, uint256 amountTHB);
    event Burn(address indexed recipient, uint256 amountTVER, uint256 amountTHB);
    event Swap(
        address indexed sender,
        uint256 amountTVERIn,
        uint256 amountTHBIn,
        uint256 amountTVEROut,
        uint256 amountTHBOut
    );

    constructor(IFeeManager _FEE_MANAGER, IERC20 _TVER, IERC20 _THB) ERC20("TVER-THB LP Token", "TVER-THB-LPT") {
        FEE_MANAGER = _FEE_MANAGER;
        TVER = _TVER;
        THB = _THB;
    }

    function mint(
        address recipient
    ) external nonReentrant returns (uint256 liquidity) {
        uint256 _reserveTVER = reserveTVER; // Gas saving, prevents repeated use of SLOAD
        uint256 _reserveTHB = reserveTHB; // Gas saving, prevents repeated use of SLOAD
        uint256 balanceTVER = TVER.balanceOf(address(this)); // Gas saving, prevents repeated use of SLOAD
        uint256 balanceTHB = THB.balanceOf(address(this)); // Gas saving, prevents repeated use of SLOAD

        uint256 amountTVER = balanceTVER > _reserveTVER ? balanceTVER - _reserveTVER : 0;
        uint256 amountTHB = balanceTHB > _reserveTHB ? balanceTHB - _reserveTHB : 0;

        uint256 totalSupply = totalSupply(); //Gas saving, prevents repeated use of SLOAD

        if (totalSupply == 0) {
            liquidity = Math.sqrt(amountTVER * amountTHB) - MINIMUM_LIQUIDITY;
            _mint(address(0), MINIMUM_LIQUIDITY); // makes sure no one can hold 100% of the pool and gatekeep it by manupulating token balances
        } else {
            liquidity = Math.min(
                (amountTVER * totalSupply) / _reserveTVER,
                (amountTHB * totalSupply) / _reserveTHB
            );
            _mint(recipient, liquidity);
        }
        require(liquidity > 0, "Liquidity amount must be greater than 0");

        _updateReserves(balanceTVER, balanceTHB);

        emit Mint(recipient, amountTVER, amountTHB);
    }

    function burn(
        address recipient
    ) external nonReentrant returns (uint256 amountTVER, uint256 amountTHB) {
        IERC20 _TVER = TVER; // Gas saving, prevents repeated use of SLOAD
        IERC20 _THB = THB; // Gas saving, prevents repeated use of SLOAD
        uint256 balanceTVER = _TVER.balanceOf(address(this)); // Gas saving, prevents repeated use of SLOAD
        uint256 balanceTHB = _THB.balanceOf(address(this)); // Gas saving, prevents repeated use of SLOAD
        uint256 liquidity = balanceOf(address(this)); // Gas saving, prevents repeated use of SLOAD

        uint256 _totalSupply = totalSupply(); // Gas saving, prevents repeated use of SLOAD

        amountTVER = (liquidity * balanceTVER) / _totalSupply;
        amountTHB = (liquidity * balanceTHB) / _totalSupply;
        require(amountTVER > 0 && amountTHB > 0, "Amounts must be greater than 0");

        _burn(address(this), liquidity);

        _TVER.safeTransfer(recipient, amountTVER);
        _THB.safeTransfer(recipient, amountTHB);

        balanceTVER = _TVER.balanceOf(address(this)); // Update balanceTVER after transfer token transfers
        balanceTHB = _THB.balanceOf(address(this)); // Update balanceTHB after token transfers

        _updateReserves(balanceTVER, balanceTHB);

        emit Burn(recipient, amountTVER, amountTHB);
    }

    function swap(
        uint256 amountTVEROut,
        uint256 amountTHBOut,
        address recipient
    ) external nonReentrant {
        require(amountTVEROut > 0 || amountTHBOut > 0, "Both amounts cannot be 0");
        uint256 _reserveTVER = reserveTVER; // Gas saving, prevents repeated use of SLOAD
        uint256 _reserveTHB = reserveTHB; // Gas saving, prevents repeated use of SLOAD
        require(
            amountTVEROut < _reserveTVER && amountTHBOut < _reserveTHB,
            "Insufficient liquidity"
        );

        IERC20 _TVER = TVER; // Gas saving, prevents repeated use of SLOAD
        IERC20 _THB = THB; // Gas saving, prevents repeated use of SLOAD

        require(
            recipient != address(_TVER) && recipient != address(_THB),
            "Invalid recipient"
        );
        if (amountTVEROut > 0) {
            _TVER.safeTransfer(recipient, amountTVEROut);
        }
        if (amountTHBOut > 0) {
            _THB.safeTransfer(recipient, amountTHBOut);
        }
        uint256 balanceTVER = _TVER.balanceOf(address(this)); // Gas saving, prevents repeated use of SLOAD
        uint256 balanceTHB = _THB.balanceOf(address(this)); // Gas saving, prevents repeated use of SLOAD

        uint256 amountTVERIn = balanceTVER > _reserveTVER - amountTVEROut
            ? balanceTVER - (_reserveTVER - amountTVEROut)
            : 0;
        uint256 amountTHBIn = balanceTHB > _reserveTHB - amountTHBOut
            ? balanceTHB - (_reserveTHB - amountTHBOut)
            : 0;
        require(amountTVERIn > 0 || amountTHBIn > 0, "Insufficient input amount");

        uint16 _fee = FEE_MANAGER.getFee();
        uint256 balanceTVERAdjusted = (balanceTVER * 10_000) - (amountTVERIn * _fee);
        uint256 balanceTHBAdjusted = (balanceTHB * 10_000) - (amountTHBIn * _fee);
        //todo fee management for protocol fees will be added here

        require(
            balanceTVERAdjusted * balanceTHBAdjusted >=
                uint256(_reserveTVER) * _reserveTHB * 1000 ** 2,
            "K invariant not maintained"
        );

        _updateReserves(balanceTVER, balanceTHB);

        emit Swap(msg.sender, amountTVERIn, amountTHBIn, amountTVEROut, amountTHBOut);
    }

    function skim(address recipient) external nonReentrant {
        IERC20 _TVER = TVER; // Gas saving, prevents repeated use of SLOAD
        IERC20 _THB = THB; // Gas saving, prevents repeated use of SLOAD

        _TVER.safeTransfer(recipient, _TVER.balanceOf(address(this)) - reserveTVER);
        _THB.safeTransfer(recipient, _THB.balanceOf(address(this)) - reserveTHB);
    }

    function sync() external nonReentrant {
        _updateReserves(
            TVER.balanceOf(address(this)),
            THB.balanceOf(address(this))
        );
    }

    function getReserves() external view returns (uint256, uint256) {
        return (reserveTVER, reserveTHB);
    }

    function _updateReserves(uint256 balanceTVER, uint256 balanceTHB) internal {
        reserveTVER = uint128(balanceTVER);
        reserveTHB = uint128(balanceTHB);
    }
}
