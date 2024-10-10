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
        const date = new Date();
        date.setDate(date.getDate() - weeks * 7);
        return await Volume.find({ timestamp: { $gte: date.getTime() / 1000 } }).sort({ timestamp: 1 });
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        return [];
    }
}

export const getVolumeLastDays = async (days: number) => {
    try {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return await Volume.find({ timestamp: { $gte: date.getTime() / 1000 } }).sort({ timestamp: 1 });
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        return [];
    }
}

export const getVolumeLastHours = async (hours: number) => {
    try {
        const date = new Date();
        date.setHours(date.getHours() - hours);
        return await Volume.find({ timestamp: { $gte: date.getTime() / 1000 } }).sort({ timestamp: 1 });
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        return [];
    }
}