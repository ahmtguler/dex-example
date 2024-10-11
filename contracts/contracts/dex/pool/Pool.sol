// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {IPool} from "./IPool.sol";
import {IFeeManager} from "../../fee-manager/IFeeManager.sol";

contract Pool is ReentrancyGuard, ERC20, IPool {
    using SafeERC20 for IERC20;
    using Math for uint256;

    uint256 private constant MINIMUM_LIQUIDITY = 10 ** 3;

    IFeeManager public immutable FEE_MANAGER;
    IERC20 public immutable TVER;
    IERC20 public immutable THB;

    uint256 public reserveTVER; // takes up single storage slot combined with reserveTHB
    uint256 public reserveTHB;

    event Mint(
        address indexed recipient,
        uint256 amountTVER,
        uint256 amountTHB
    );
    event Burn(
        address indexed recipient,
        uint256 amountTVER,
        uint256 amountTHB
    );
    event Swap(
        address indexed recipient,
        uint256 amountTVERIn,
        uint256 amountTHBIn,
        uint256 amountTVEROut,
        uint256 amountTHBOut
    );
    event Sync(uint256 reserveTVER, uint256 reserveTHB);
    event Skim(address indexed recipient, uint256 amountTVER, uint256 amountTHB);

    constructor(
        IFeeManager _FEE_MANAGER,
        IERC20 _TVER,
        IERC20 _THB
    ) ERC20("TVER-THB LP Token", "TVER-THB-LPT") {
        FEE_MANAGER = _FEE_MANAGER;
        TVER = _TVER;
        THB = _THB;
    }

    /// @notice Mints liquidity tokens
    /// @param recipient address to receive the liquidity tokens
    /// @return liquidity amount of liquidity tokens minted
    /// @dev This is a low level function that should be called from the router contract
    /// tokens are optimistically transferred to the pool then in the same transaction
    /// pool is called to mint liquidity tokens. Pool accepts all the excess tokens
    /// to be send by the caller.
    function mint(
        address recipient
    ) external nonReentrant returns (uint256 liquidity) {
        uint256 _reserveTVER = reserveTVER; // Gas saving, prevents repeated use of SLOAD
        uint256 _reserveTHB = reserveTHB; // Gas saving, prevents repeated use of SLOAD
        uint256 balanceTVER = TVER.balanceOf(address(this)); // Gas saving, prevents repeated use of SLOAD
        uint256 balanceTHB = THB.balanceOf(address(this)); // Gas saving, prevents repeated use of SLOAD

        uint256 amountTVER = balanceTVER > _reserveTVER
            ? balanceTVER - _reserveTVER
            : 0;
        uint256 amountTHB = balanceTHB > _reserveTHB
            ? balanceTHB - _reserveTHB
            : 0;

        uint256 totalSupply = totalSupply(); //Gas saving, prevents repeated use of SLOAD

        if (totalSupply == 0) {
            liquidity = Math.sqrt(amountTVER * amountTHB) - MINIMUM_LIQUIDITY;
            // below line makes sure no one can hold 100% of the pool and gatekeep it by manupulating token balances
            _mint(0x0000000000000000000000000000000000000001, MINIMUM_LIQUIDITY); 
        } else {
            liquidity = Math.min(
                (amountTVER * totalSupply) / _reserveTVER,
                (amountTHB * totalSupply) / _reserveTHB
            );
        }
        require(liquidity > 0, "Liquidity amount must be greater than 0");
        _mint(recipient, liquidity);

        _updateReserves(balanceTVER, balanceTHB);

        emit Mint(recipient, amountTVER, amountTHB);
    }


    /// @notice Burns liquidity tokens and returns the underlying tokens
    /// @param recipient address to receive the underlying tokens
    /// @return amountTVER amount of TVER tokens returned
    /// @return amountTHB amount of THB tokens returned
    /// @dev This is a low level function that should be called from the router contract
    /// liquidity tokens optimistically transferred to the pool then in the same transaction
    /// pool is called to burn amount of liquidity tokens it holds and send the underlying
    /// tokens to the recipient.
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
        require(
            amountTVER > 0 && amountTHB > 0,
            "Amounts must be greater than 0"
        );

        _burn(address(this), liquidity);

        _TVER.safeTransfer(recipient, amountTVER);
        _THB.safeTransfer(recipient, amountTHB);

        balanceTVER = _TVER.balanceOf(address(this)); // Update balanceTVER after transfer token transfers
        balanceTHB = _THB.balanceOf(address(this)); // Update balanceTHB after token transfers

        _updateReserves(balanceTVER, balanceTHB);

        emit Burn(recipient, amountTVER, amountTHB);
    }

    /// @notice Swaps tokens
    /// @param amountTVEROut amount of TVER tokens to send
    /// @param amountTHBOut amount of THB tokens to send
    /// @param recipient address to receive the swapped tokens
    /// @dev This is a low level function that should be called from the router contract
    /// This function is used to swap tokens between TVER and THB. Again, the tokens are
    /// optimistically transferred to the pool then in the same transaction pool is called.
    /// Pool sends the requested amount of tokens to the recipient then checks if the remaining
    /// reserves are enough to maintain the K invariant, proving that it was a valid swap request.
    function swap(
        uint256 amountTVEROut,
        uint256 amountTHBOut,
        address recipient
    ) external nonReentrant {
        require(
            amountTVEROut > 0 || amountTHBOut > 0,
            "Both amounts cannot be 0"
        );
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
        require(
            amountTVERIn > 0 || amountTHBIn > 0,
            "Insufficient input amount"
        );

        {
            // scope to avoid stack too deep error
            (, uint16 platformFee, uint16 totalFee) = FEE_MANAGER.getFees();

            uint256 balTVERAdjusted = ((balanceTVER) * 10_000) - (amountTVERIn * totalFee);
            uint256 balTHBAdjusted = (balanceTHB * 10_000) - (amountTHBIn * totalFee);

            require(
                balTVERAdjusted * balTHBAdjusted >= _reserveTVER * _reserveTHB * (10_000 ** 2),
                "K invariant not maintained"
            );

            // Sending fee tokens on each swap is not gas efficient and only implemented this for clarity in the scope of the task
            if (platformFee > 0) {
                uint256 tverFee = (amountTVERIn * platformFee) / 10_000;
                if (tverFee > 0) {
                    _TVER.safeTransfer(address(FEE_MANAGER), tverFee);
                    balanceTVER = _TVER.balanceOf(address(this)); // Update balanceTVER after token transfer
                }

                uint256 thbFee = (amountTHBIn * platformFee) / 10_000;
                if (thbFee > 0) {
                    _THB.safeTransfer(address(FEE_MANAGER), thbFee);
                    balanceTHB = _THB.balanceOf(address(this)); // Update balanceTHB after token transfer
                }
            }
        }

        _updateReserves(balanceTVER, balanceTHB);

        emit Swap(
            recipient,
            amountTVERIn,
            amountTHBIn,
            amountTVEROut,
            amountTHBOut
        );
    }

    /// @notice Skims the excess tokens from the pool
    /// @param recipient address to receive the excess tokens
    /// @dev This function is used to skim the excess tokens from the pool. This function
    /// can be called by everyone and the excess tokens are sent to the recipient.
    function skim(address recipient) external nonReentrant {
        IERC20 _TVER = TVER; // Gas saving, prevents repeated use of SLOAD
        IERC20 _THB = THB; // Gas saving, prevents repeated use of SLOAD
        uint256 amountTVER = _TVER.balanceOf(address(this)) - reserveTVER;
        uint256 amountTHB = _THB.balanceOf(address(this)) - reserveTHB;

        _TVER.safeTransfer(
            recipient,
            amountTVER
        );
        _THB.safeTransfer(
            recipient,
            amountTHB
        );

        emit Skim(recipient, amountTVER, amountTHB);
    }

    /// @notice Syncs the reserves
    /// @dev This function is used to sync the reserves of the pool with the actual
    /// token balances. This function can be called by everyone.
    function sync() external nonReentrant {
        _updateReserves(
            TVER.balanceOf(address(this)),
            THB.balanceOf(address(this))
        );
    }
 
    /// @notice Returns the reserves
    /// @return reserveTVER amount of TVER tokens in the pool
    /// @return reserveTHB amount of THB tokens in the pool
    function getReserves() external view returns (uint256, uint256) {
        return (reserveTVER, reserveTHB);
    }

    /// @notice Internal function that is used for updating the reserves
    /// @param balanceTVER updated balance of TVER tokens
    /// @param balanceTHB updated balance of THB tokens
    function _updateReserves(uint256 balanceTVER, uint256 balanceTHB) internal {
        reserveTVER = uint128(balanceTVER);
        reserveTHB = uint128(balanceTHB);
        emit Sync(reserveTVER, reserveTHB);
    }
}
