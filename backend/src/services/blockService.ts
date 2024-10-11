import Block from "../models/block";

export const addBlock = async (lastIndexedBlockNumber: number, timestamp: number) => {
    try {
        const block = new Block({
            lastIndexedBlockNumber,
            timestamp,
        });
        await block.save();
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
    }
};

export const getBlocks = async () => {
    try {
        return await Block.find().sort({ timestamp: -1 });
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        return [];
    }
};

export const getLastBlock = async () => {
    try {
        return await Block.findOne().sort({ lastIndexedBlockNumber: -1 });
    }
    catch (error: any) {
        console.error(`Error: ${error.message}`);
        return null;
    }
}

export const dropBlocks = async () => {
    try {
        await Block.deleteMany({});
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
    }
}