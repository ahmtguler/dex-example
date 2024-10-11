import connectDB from "./src/config/database";
import app from "./src/app";
import { drop, init, index } from "./src/indexer/indexer";
import dotenv from "dotenv";
dotenv.config();

const startServer = async () => {
    console.log("Starting server...");
    await connectDB();
    console.log("Connected to database");

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

    await drop(); //? For testing purposes
    await init(); //? For testing purposes
    index();
};

startServer();
