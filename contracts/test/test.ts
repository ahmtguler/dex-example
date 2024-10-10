import { expect } from "chai";
import { ethers } from "hardhat";
import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";

import { FeeManager, MintableToken, Pool, Router, GovernanceToken, GovernorContract } from "../typechain-types";

const ZERO_ONE_ADDR = "0x0000000000000000000000000000000000000001";

describe("DEX", function () {
    async function deployDexFixture() {
        const signer = (await ethers.getSigners())[0];
        const mintableTokenFactory = await ethers.getContractFactory(
            "MintableToken"
        );

        const TVER = (await mintableTokenFactory.deploy(
            "TVER",
            "TVER"
        )) as MintableToken;
        await TVER.waitForDeployment();

        const THB = (await mintableTokenFactory.deploy(
            "THB",
            "THB"
        )) as MintableToken;
        await THB.waitForDeployment();

        const feeManagerFactory = await ethers.getContractFactory("FeeManager");
        const FeeManager = (await feeManagerFactory.deploy(
            10n,
            30n,
            await signer.getAddress()
        )) as FeeManager;
        await FeeManager.waitForDeployment();

        const poolFactory = await ethers.getContractFactory("Pool");
        const Pool = (await poolFactory.deploy(
            await FeeManager.getAddress(),
            await TVER.getAddress(),
            await THB.getAddress()
        )) as Pool;
        await Pool.waitForDeployment();

        const routerFactory = await ethers.getContractFactory("Router");
        const Router = (await routerFactory.deploy(
            await Pool.getAddress(),
            await FeeManager.getAddress(),
            await TVER.getAddress(),
            await THB.getAddress()
        )) as Router;
        await Router.waitForDeployment();

        return { TVER, THB, FeeManager, Pool, Router };
    }

    async function addInitialLp(_tver: MintableToken, _thb: MintableToken, _router: Router) {

        const signer = (await ethers.getSigners())[0];
        const amount = ethers.parseEther("1000");
        await _tver.mint(await signer.getAddress(), amount);
        await _thb.mint(await signer.getAddress(), amount);

        await _tver.approve(await _router.getAddress(), amount);
        await _thb.approve(await _router.getAddress(), amount);

        await _router.addLiquidity(
            amount,
            amount,
            0n,
            0n,
            await signer.getAddress(),
            await time.latest() + 1000
        );
    }

    it("should deploy the contract", async function () {
        await loadFixture(deployDexFixture);
    });

    it("should add liquidity", async function () {
        const { TVER, THB, FeeManager, Pool, Router } = await loadFixture(
            deployDexFixture
        );

        await addInitialLp(TVER, THB, Router);

        const signer = (await ethers.getSigners())[0];

        const balance1 = await Pool.balanceOf(ZERO_ONE_ADDR);
        expect(balance1).to.equal(1e3);
        const totalSupply = await Pool.totalSupply();
        const balanceUser = await Pool.balanceOf(await signer.getAddress());
        expect(balanceUser).to.equal(totalSupply - balance1);
    });

    it("should swap exact tokens", async function () {
        const { TVER, THB, FeeManager, Pool, Router } = await loadFixture(
            deployDexFixture
        );

        await addInitialLp(TVER, THB, Router);

        const signer2 = (await ethers.getSigners())[1]; // new signer

        const amount = ethers.parseEther("10");
        await TVER.connect(signer2).mint(await signer2.getAddress(), amount);
        await TVER.connect(signer2).approve(await Router.getAddress(), amount);

        const balanceTHBBefore = await THB.balanceOf(await signer2.getAddress());
        const balanceTVERBefore = await TVER.balanceOf(await signer2.getAddress());
        const balanceTVERPoolBefore = await TVER.balanceOf(await Pool.getAddress());
        const balanceTHBPoolBefore = await THB.balanceOf(await Pool.getAddress());

        await Router.connect(signer2).swapExactTokens(
            amount,
            0n,
            0n,
            await signer2.getAddress(),
            await time.latest() + 1000
        );
        
        const balanceTHBAfter = await THB.balanceOf(await signer2.getAddress());
        expect(balanceTHBAfter).to.be.gt(balanceTHBBefore);
        const balanceTVERAfter = await TVER.balanceOf(await signer2.getAddress());
        expect(balanceTVERAfter).to.be.lte(balanceTVERBefore - amount);


        const balanceTVERPoolAfter = await TVER.balanceOf(await Pool.getAddress());
        const fees = await FeeManager.getFees();
        const fee = amount * fees.platformFee / 10_000n;
        expect(balanceTVERPoolAfter).to.equal(balanceTVERPoolBefore + amount - fee);
        const balanceTHBPoolAfter = await THB.balanceOf(await Pool.getAddress());
        expect(balanceTHBPoolAfter).to.equal(balanceTHBPoolBefore - balanceTHBAfter);
    });

    it("should remove liquidity", async function () {
        const { TVER, THB, FeeManager, Pool, Router } = await loadFixture(
            deployDexFixture
        );

        await addInitialLp(TVER, THB, Router);

        const signer = (await ethers.getSigners())[0];

        const pooltverBalBefore = await TVER.balanceOf(await Pool.getAddress());
        const poolthbBalBefore = await THB.balanceOf(await Pool.getAddress());
        const balanceUser = await Pool.balanceOf(await signer.getAddress());
        const tverBalBefore = await TVER.balanceOf(await signer.getAddress());
        const thbBalBefore = await THB.balanceOf(await signer.getAddress());


        await Pool.approve(await Router.getAddress(), balanceUser);

        await Router.removeLiquidity(
            balanceUser,
            0n,
            0n,
            await signer.getAddress(),
            await time.latest() + 1000
        );

        const balanceUserAfter = await Pool.balanceOf(await signer.getAddress());
        expect(balanceUserAfter).to.equal(0);

        const pooltverBalAfter = await TVER.balanceOf(await Pool.getAddress());
        expect(pooltverBalAfter).to.lt(pooltverBalBefore);

        const poolthbBalAfter = await THB.balanceOf(await Pool.getAddress());
        expect(poolthbBalAfter).to.lt(poolthbBalBefore);

        const tverBalAfter = await TVER.balanceOf(await signer.getAddress());
        expect(tverBalAfter).to.equal(tverBalBefore + (pooltverBalBefore - pooltverBalAfter));
        
        const thbBalAfter = await THB.balanceOf(await signer.getAddress());
        expect(thbBalAfter).to.equal(thbBalBefore + (poolthbBalBefore - poolthbBalAfter));



    });
});
