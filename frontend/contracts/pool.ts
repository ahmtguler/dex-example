import { Contract } from "ethers";
import { poolAbi } from "./abi/pool";

export const POOL_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
export const POOL = new Contract(POOL_ADDRESS, poolAbi);