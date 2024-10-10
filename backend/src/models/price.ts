import { Schema, model } from "mongoose";

const priceSchema = new Schema({
    price: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Number,
        required: true,
    },
});

export default model("Price", priceSchema);