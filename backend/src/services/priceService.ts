import Price from "../models/price";

export const addPrice = async (price: string, timestamp: number) => {
    try {
        const newPrice = new Price({
            price,
            timestamp,
        });
        await newPrice.save();
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
    }
};

export const getPrices = async () => {
    try {
        return await Price.find().sort({ timestamp: -1 });
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        return [];
    }
};

export const getPriceFromTimestamp = async (timestamp: number) => {
    try {   
        // timeswamp greater than given one
        return await Price.find({ timestamp: { $gte: timestamp } }).sort({ timestamp: 1 });
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        return null;
    }
}

export const getPriceLastWeeks = async (weeks: number) => {
    try {
        const date = new Date();
        date.setDate(date.getDate() - weeks * 7);
        return await Price.find({ timestamp: { $gte: date.getTime() / 1000 } }).sort({ timestamp: 1 });
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        return [];
    }
}

export const getPriceLastDays = async (days: number) => {
    try {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return await Price.find({ timestamp: { $gte: date.getTime() / 1000 } }).sort({ timestamp: 1 });
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        return [];
    }
}

export const getPriceLastHours = async (hours: number) => {
    try {
        const date = new Date();
        date.setHours(date.getHours() - hours);
        return await Price.find({ timestamp: { $gte: date.getTime() / 1000 } }).sort({ timestamp: 1 });
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        return [];
    }
}