import { Schema, model } from "mongoose";

const mintSchema = new Schema({
    recipient: {
        type: String,
        required: true,
    },
    amountTVER: {
        type: String,
        required: true,
    },
    amountTHB: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Number,
        required: true,
    },
});

export default model("Mint", mintSchema);