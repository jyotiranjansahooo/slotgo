import http from "node:http";
import dotenv from "dotenv";
import app from "./app.js";
import connectDatabase from "./config/database.js";
import logger from "./utils/logger.js";
dotenv.config();
const PORT = Number(process.env.PORT) || 5000;
const startServer = async () => {
    try {
        await connectDatabase();
        const server = http.createServer(app);
        server.listen(PORT, () => {
            logger.divider();
            logger.success("🚗 SlotGo Backend Started");
            logger.info(`🚀 Server      : http://localhost:${PORT}`);
            logger.divider();
        });
    }
    catch (error) {
        logger.error(error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map