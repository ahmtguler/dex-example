import { ethers } from "hardhat";
import hre from "hardhat";
import { FeeManager, MintableToken, Pool, Router, GovernorContract, GovernanceToken } from "../typechain-types";

async function main() {
    const mintableTokenFactory = await ethers.getContractFactory(
        "MintableToken"
    );

    const TVER = (await mintableTokenFactory.deploy(
        "TVER",
        "TVER"
    )) as MintableToken;
    await TVER.waitForDeployment();
    const TVER_ADDRESS = await TVER.getAddress();
    console.log("TVER_ADDRESS", TVER_ADDRESS);

    const THB = (await mintableTokenFactory.deploy(
        "THB",
        "THB"
    )) as MintableToken;
    await THB.waitForDeployment();
    const THB_ADDRESS = await THB.getAddress();
    console.log("THB_ADDRESS", THB_ADDRESS);

    const governanceTokenFactory = await ethers.getContractFactory(
        "GovernanceToken"
    );
    const GovernanceTKN = (await governanceTokenFactory.deploy()) as GovernanceToken;
    await GovernanceTKN.waitForDeployment();
    const GovernanceTKN_ADDRESS = await GovernanceTKN.getAddress();
    console.log("GovernanceTKN_ADDRESS", GovernanceTKN_ADDRESS);

    const governorFactory = await ethers.getContractFactory("GovernorContract");
    const Governer = (await governorFactory.deploy(
        await GovernanceTKN.getAddress()
    )) as GovernorContract;
    await Governer.waitForDeployment();
    const Governer_ADDRESS = await Governer.getAddress();
    console.log("Governer_ADDRESS", Governer_ADDRESS);

    const feeManagerFactory = await ethers.getContractFactory("FeeManager");
    const FeeManager = (await feeManagerFactory.deploy(
        10n,
        30n,
        await Governer.getAddress()
    )) as FeeManager;
    await FeeManager.waitForDeployment();
    const FeeManager_ADDRESS = await FeeManager.getAddress();
    console.log("FeeManager_ADDRESS", FeeManager_ADDRESS);

    const poolFactory = await ethers.getContractFactory("Pool");
    const Pool = (await poolFactory.deploy(
        await FeeManager.getAddress(),
        await TVER.getAddress(),
        await THB.getAddress()
    )) as Pool;
    await Pool.waitForDeployment();
    const Pool_ADDRESS = await Pool.getAddress();
    console.log("Pool_ADDRESS", Pool_ADDRESS);

    const routerFactory = await ethers.getContractFactory("Router");
    const Router = (await routerFactory.deploy(
        await Pool.getAddress(),
        await FeeManager.getAddress(),
        await TVER.getAddress(),
        await THB.getAddress()
    )) as Router;
    await Router.waitForDeployment();
    const Router_ADDRESS = await Router.getAddress();
    console.log("Router_ADDRESS", Router_ADDRESS);
    
    console.log("Sleeping for 30 seconds before verifying...");
    await new Promise((r) => setTimeout(r, 30000));
    console.log("Done sleeping");

    await hre.run("verify:verify", {
        address: TVER_ADDRESS,
        constructorArguments: ["TVER", "TVER"],
    });

    await hre.run("verify:verify", {
        address: THB_ADDRESS,
        constructorArguments: ["THB", "THB"],
    });

    await hre.run("verify:verify", {
        address: GovernanceTKN_ADDRESS,
        constructorArguments: [],
    });

    await hre.run("verify:verify", {
        address: Governer_ADDRESS,
        constructorArguments: [await GovernanceTKN.getAddress()],
    });

    await hre.run("verify:verify", {
        address: FeeManager_ADDRESS,
        constructorArguments: [10n, 30n, await Governer.getAddress()],
    });

    await hre.run("verify:verify", {
        address: Pool_ADDRESS,
        constructorArguments: [
            await FeeManager.getAddress(),
            await TVER.getAddress(),
            await THB.getAddress(),
        ],
    });

    await hre.run("verify:verify", {
        address: Router_ADDRESS,
        constructorArguments: [
            await Pool.getAddress(),
            await FeeManager.getAddress(),
            await TVER.getAddress(),
            await THB.getAddress(),
        ],
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
