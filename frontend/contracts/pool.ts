import { Pool__factory } from "@/typechain-types";

export const POOL_ADDRESS = "0x391B1ad313d54807bce21F544B109C717f818A3a";
export const POOL = Pool__factory.connect(POOL_ADDRESS);