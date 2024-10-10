import { Schema, model } from "mongoose";

const syncSchema = new Schema({
    reserveTVER: {
        type: String,
        required: true,
    },
    reserveTHB: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Number,
        required: true,
    },
});

export default model("Sync", syncSchema);
