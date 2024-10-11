import Volume from "../models/volume";

export const addVolume = async (thbAmount: string, timestamp: number) => {
    try {
        const volume = new Volume({
            thbAmount,
            timestamp,
        });
        await volume.save();
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
    }
};

export const getVolumes = async () => {
    try {
        return await Volume.find().sort({ timestamp: -1 });
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        return [];
    }
};

export const getVolumeFromTimestamp = async (timestamp: number) => {
    try {
        return await Volume.find({ timestamp: { $gte: timestamp } }).sort({ timestamp: 1 });
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        return null;
    }
}

export const getVolumeLastWeeks = async (weeks: number) => {
    try {
        const date = Date.now() / 1000 - (weeks * 24 * 3600 * 7);
        return await Volume.find({ timestamp: { $gte: date } }).sort({ timestamp: 1 });
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        return [];
    }
}

export const getVolumeLastDays = async (days: number) => {
    try {
        const date = Date.now() / 1000 - (days * 24 * 3600);
        return await Volume.find({ timestamp: { $gte: date } }).sort({ timestamp: 1 });
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        return [];
    }
}

export const getVolumeLastHours = async (hours: number) => {
    try {
        const date = Date.now() / 1000 - (hours * 3600);
        return await Volume.find({ timestamp: { $gte: date } }).sort({ timestamp: 1 });
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        return [];
    }
}