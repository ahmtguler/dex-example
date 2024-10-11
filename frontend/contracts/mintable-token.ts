import { MintableToken__factory } from "@/typechain-types";

export const TVER_ADDRESS = "0xC41A73B51c582c5b980aB17C64A7c0119289191c";
export const THB_ADDRESS = "0xe6ca94c57B4251f6b2046B07Bc3c516032981a14";

export const TVER = MintableToken__factory.connect(TVER_ADDRESS);
export const THB = MintableToken__factory.connect(THB_ADDRESS);
