import { Schema, model } from "mongoose";

const swapSchema = new Schema({
    chainId: {
        type: Number,
        required: true,
    },
    contractAddress: {
        type: String,
        required: true,
    },
    rpcUrl: {
        type: String,
        required: true,
    },
    lastIndexedBlock: {
        type: Number,
        required: true,
    },
    blockConfirmations: {
        type: Number,
        required: true,
    },
});

export default model("Swap", swapSchema);
