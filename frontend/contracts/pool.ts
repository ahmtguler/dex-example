import { Pool__factory } from "@/typechain-types";

export const POOL_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
export const POOL = Pool__factory.connect(POOL_ADDRESS);