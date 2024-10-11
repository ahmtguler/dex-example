import { formatEther } from "ethers";

export function readableAmount(
    wei: bigint | string,
    maxDecimals: number = 18,
    rounding: "floor" | "ceil" | "round" = "round"
) { 
    if (typeof wei !== "bigint" && typeof wei !== "string") {
        return "0";
    }
    if (typeof wei === "string") {
        wei = BigInt(wei);
    }   
    const power = 10n ** BigInt(18 - maxDecimals);
    const remainder = wei % power;
    const firstDecimal = remainder / 10n ** BigInt(18 - maxDecimals - 1);

    let b = wei - remainder;

    if (rounding === "ceil" || (rounding === "round" && firstDecimal >= 5)) {
        b += power;
    }

    return formatEther(b);
}
