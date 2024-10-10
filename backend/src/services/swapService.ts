import Swap from "../models/swap";

export const addSwap = async (
    recipient: string,
    tokenIn: string,
    amountIn: string,
    tokenOut: string,
    amountOut: string,
    timestamp: number
) => {
    try {
        const swap = new Swap({
            recipient,
            tokenIn,
            amountIn,
            tokenOut,
            amountOut,
            timestamp,
        });
        await swap.save();
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
    }
};

export const getSwaps = async () => {
    try {
        return await Swap.find().sort({ timestamp: -1 });
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        return [];
    }
};

export const getSwapsByRecipient = async (recipient: string) => {
    try {
        return await Swap.find({ recipient }).sort({ timestamp: -1 });
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        return [];
    }
}
