import Sync from "../models/sync";

export const addReserves = async (reserveTVER: string, reserveTHB: string, timestamp: number) => {
    try {
        const sync = new Sync({
            reserveTVER,
            reserveTHB,
            timestamp,
        });
        await sync.save();
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
    }
};

export const getReserves = async () => {
    try {
        return await Sync.find().sort({ timestamp: -1 });
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        return [];
    }
};

export const getLatestReserves = async () => {
    try {
        return await Sync.findOne().sort({ timestamp: -1 });
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        return null;
    }
}