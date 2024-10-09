export const routerAbi = [
    {
        inputs: [
            {
                internalType: "contract IPool",
                name: "_pool",
                type: "address",
            },
            {
                internalType: "contract IFeeManager",
                name: "_feeManager",
                type: "address",
            },
            {
                internalType: "contract IERC20",
                name: "_TVER",
                type: "address",
            },
            {
                internalType: "contract IERC20",
                name: "_THB",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "target",
                type: "address",
            },
        ],
        name: "AddressEmptyCode",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "AddressInsufficientBalance",
        type: "error",
    },
    {
        inputs: [],
        name: "FailedInnerCall",
        type: "error",
    },
    {
        inputs: [],
        name: "ReentrancyGuardReentrantCall",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
        ],
        name: "SafeERC20FailedOperation",
        type: "error",
    },
    {
        inputs: [],
        name: "THB",
        outputs: [
            {
                internalType: "contract IERC20",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "TVER",
        outputs: [
            {
                internalType: "contract IERC20",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "amountTVERDesired",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "amountTHBDesired",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "amountTVERMin",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "amountTHBMin",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "recipient",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "deadline",
                type: "uint256",
            },
        ],
        name: "addTVERTHBLiquidity",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "feeManager",
        outputs: [
            {
                internalType: "contract IFeeManager",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "pool",
        outputs: [
            {
                internalType: "contract IPool",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "liquidityAmount",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "amountTVERMin",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "amountTHBMin",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "recipient",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "deadline",
                type: "uint256",
            },
        ],
        name: "removeLiquidity",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "amountIn",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "amountOutMin",
                type: "uint256",
            },
            {
                internalType: "uint8",
                name: "direction",
                type: "uint8",
            },
            {
                internalType: "address",
                name: "recipient",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "deadline",
                type: "uint256",
            },
        ],
        name: "swapExactTokens",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
];
