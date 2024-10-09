import { Contract } from "ethers";
import { routerAbi } from "./abi/router";

export const ROUTER_ADDRESS = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
export const ROUTER = new Contract(ROUTER_ADDRESS, routerAbi);