import { MintableToken__factory } from "@/typechain-types";

export const TVER_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const THB_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export const TVER = MintableToken__factory.connect(TVER_ADDRESS);
export const THB = MintableToken__factory.connect(THB_ADDRESS);
