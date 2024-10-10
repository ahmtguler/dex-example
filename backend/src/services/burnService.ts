import Burn from "../models/burn";

export const addBurn = async (
    recipient: string,
    amountTVER: string,
    amountTHB: string,
    timestamp: number
) => {
    try {
        const burn = new Burn({
            recipient,
            amountTVER,
            amountTHB,
            timestamp,
        });
        await burn.save();
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
    }
};

export const getBurns = async () => {
    try {
        return await Burn.find().sort({ timestamp: -1 });
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        return [];
    }
};

export const getBurnsByRecipient = async (recipient: string) => {
    try {
        return await Burn.find({ recipient }).sort({ timestamp: -1 });
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        return [];
    }
}