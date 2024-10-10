import { Schema, model } from "mongoose";

const volumeSchema = new Schema({
    thbAmount: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Number,
        required: true,
    },
});

export default model("Volume", volumeSchema);