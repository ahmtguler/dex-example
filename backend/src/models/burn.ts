import { Schema, model } from "mongoose";

const burnSchema = new Schema({
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

export default model("Burn", burnSchema);