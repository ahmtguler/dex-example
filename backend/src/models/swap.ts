import { Schema, model } from "mongoose";

const swapSchema = new Schema({
    recipient: {
        type: String,
        required: true,
    },
    tokenIn: {
        type: String,
        required: true,
    },
    amountIn: {
        type: String,
        required: true,
    },
    tokenOut: {
        type: String,
        required: true,
    },
    amountOut: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Number,
        required: true,
    },
});

export default model("Swap", swapSchema);
