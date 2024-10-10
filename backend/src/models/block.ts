import { Schema, model } from "mongoose";

const blockSchema = new Schema({
    lastIndexedBlockNumber: {
        type: Number,
        required: true,
    },
    timestamp: {
        type: Number,
        required: true,
    },
});

export default model("Block", blockSchema);