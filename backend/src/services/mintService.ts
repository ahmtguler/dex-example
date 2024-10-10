import Mint from "../models/mint";

export const addMint = async (
    recipient: string,
    amountTVER: string,
    amountTHB: string,
    timestamp: number
) => {
    try {
        const mint = new Mint({
            recipient,
            amountTVER,
            amountTHB,
            timestamp,
        });
        await mint.save();
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
    }
};

export const getMints = async () => {
    try {
        return await Mint.find().sort({ timestamp: -1 });
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        return [];
    }
}

export const getMintsByRecipient = async (recipient: string) => {
    try {
        return await Mint.find({ recipient }).sort({ timestamp: -1 });
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        return [];
    }
}

