# TVER/THB DEX Project

This project is a decentralized exchange (DEX) built to trade between tokenized carbon credits (**TVER**) and tokenized Thai Baht (**THB**) on the Sepolia testnet. It was developed as part of a technical assignment to demonstrate skills in smart contract development, backend API design, and frontend integration.

## Table of Contents

-   [Overview](#overview)
-   [Project Scope](#project-scope)
-   [Architecture](#architecture)
-   [Tech Stack](#tech-stack)
-   [Deployment](#deployment)
-   [Getting Started](#getting-started)
-   [Testing](#testing)
-   [Security](#security)
-   [Gas Efficiency](#gas-efficiency)

## Overview

The project involves building a DEX where users can:

-   Add liquidity to a TVER-THB pool.
-   Swap between the two tokens using an automated market maker (AMM) model.
-   Withdraw liquidity and view transaction history.
-   Utilize a governance token to manage fees and oversee future upgrades.

## Project Scope

### Smart Contracts

-   **Liquidity Pool & AMM:** Developed a custom pool for TVER and THB with price discovery using the constant product formula (x \* y = k).
-   **Swap Fees:** Implemented fee logic directing a portion to liquidity providers and another of it to a governed fee contract.
-   **Governance:** Introduced a governance token and a governor contract overseeing a Fee Manager contract responsible for fee collection and distribution.
-   **Transparency Over Optimization:** Designed the fee collection mechanism to be clear and transparent, intentionally not fully gas-optimized to illustrate fee distribution mechanics.
-   **Libraries Used:** Leveraged OpenZeppelin’s well-audited contracts for reliability and security.

### Frontend

-   **Framework:** Built with Next.js and shadcn UI library for a responsive and modern interface.
-   **Wallet Connection:** Integrated RainbowKit for seamless MetaMask wallet connections, offering a better user experience compared to heavier alternatives like Web3Modal.
-   **Trade & Liquidity Interface:** Developed a basic yet functional UI for adding/removing liquidity and trading between tokens.
-   **Mint Functionality:** Enabled users to mint TVER and THB for testing purposes.
-   **Transaction Overview:** Partially implemented; core trading features are operational, with further enhancements limited by time constraints.

### Backend API

-   **Framework:** Built with Bun, TypeScript, and Express for a fast and efficient development environment.
-   **Data Handling:** Tracks trade data, liquidity pool statistics, and price changes. Included future-proof API endpoints for flexibility, though not all are utilized in the current frontend.
-   **Charts:** Reflects volume and price changes in real-time on the frontend.
-   **Authentication:** Data is sourced from the public blockchain, minimizing the need for authentication in the current scope. Further improvement might be done by implementing SIWE (Sign-In with Ethereum) for enhanced security.

## Architecture

The project is divided into three key components:

1. **Smart Contracts** - Manage core DEX functionalities, liquidity pools, and governance.
2. **Frontend** - Provides the user interface for interacting with the DEX.
3. **Backend API** - Supports data retrieval and real-time updates for the frontend.

## Tech Stack

-   **Smart Contracts:** Solidity, OpenZeppelin Contracts, Hardhat
-   **Frontend:** Next.js, ShadCN UI, RainbowKit, ethers.js
-   **Backend:** Bun, TypeScript, Express, MongoDB
-   **Deployment:** Sepolia Testnet (Contracts), Vercel (Frontend), Render (Backend)
-   **Testing:** Hardhat for smart contracts

## Deployment

-   **Smart Contracts:** Deployed on Sepolia Testnet. Deployed contract addresses are linked in the [here](#contract-deployments).
-   **Frontend:** Hosted on Vercel. Example link: [Frontend Demo](dex-example-eight.vercel.app)
-   **Backend API:** Running on Render.

## Getting Started

### Prerequisites

-   Bun
-   Git
-   MetaMask wallet with access to the Sepolia testnet

### Installation

1. **Clone the Repository:**

    ```bash
    git clone https://github.com/ahmtguler/dex-example.git
    cd dex-example

    ```

2. **Setup Hardhat and Smart Contracts:** Navigate to the contracts directory and install dependencies. For local test RPC node and addresses provided by hardhat must be used.

    ```bash
    cd contract
    bun install
    npx hardhat test
    npx hardhat solidity-coverage
    npx hardhat node
    npx hardhat run scripts/deploy.ts --network localnetwork
    ```

3. **Setup Backend API:** Navigate to the backend directory and install dependencies and
   Configure environment variables with your contract addresses and run the development server.

    ```bash
    cd backend
    bun install && bun run dev
    ```

4. **Setup Frontend**: Navigate to the frontend directory and install dependencies and
   Configure environment variables with your contract addresses, api url and run the development server. Add hardhat network to chain list.

    ```bash
    cd frontend
    bun install && bun run dev
    ```

## Testing

### Smart Contracts

Comprehensive tests are written for the smart contracts using Hardhat to ensure reliability and security.

```bash
cd contract
bun install
npx hardhat test
npx hardhat solidity-coverage
```

### Backend and Frontend

Note: Automated or unit tests for the backend and frontend are not included due to time constraints.

## Security

### Smart Contracts

-   Utilized OpenZeppelin’s ReentrancyGuard to prevent reentrancy attacks.
-   Followed best practices inspired by Uniswap V2 contracts.
-   Implemented governance mechanisms to manage fee distribution securely.
-   Governance token built with robust OpenZeppelin contracts, ensuring reliability and extensibility.

### Backend API:

-   All data is fetched from the public blockchain, minimizing sensitive data handling.
-   Future implementations may include SIWE (Sign-In with Ethereum) for enhanced security.

## Gas Efficiency

### Optimized Operations:

-   Built with simplicity and minimalism in mind, reusing components to save gas.
-   Common practice of copying stored values to memory to prevent repeated use of the SLOAD opcode, which consumes 100 gas each time, instead using MLOAD which consumes only 3 gas.

### Design Choices:

-   Fee collection mechanism is intentionally not fully gas-optimized to ensure transparency and clarity in fee transfers during each swap. This design choice was made to highlight fee distribution mechanics within the scope of this project.

## Contract Deployments

[TVER Token](https://sepolia.etherscan.io/address/0xC41A73B51c582c5b980aB17C64A7c0119289191c)

[THB Token](https://sepolia.etherscan.io/address/0xe6ca94c57B4251f6b2046B07Bc3c516032981a14)

[Governance Token](https://sepolia.etherscan.io/address/0x263736C85A739d58604Ac86AC0961c5689CfBD39)

[Governer](https://sepolia.etherscan.io/address/0x43F4dc05C3e02d3594330097C82d0ea6e7cc1948)

[FeeManager](https://sepolia.etherscan.io/address/0x541A6279f9c40d5ff5D4BeA31e858C1547B8c045)

[Pool](https://sepolia.etherscan.io/address/0x391B1ad313d54807bce21F544B109C717f818A3a)

[Router Token](https://sepolia.etherscan.io/address/0xeC6d04c36290a11B93C4F795658575B51B099030)
