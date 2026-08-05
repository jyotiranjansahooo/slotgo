import mongoose from "mongoose";
import { env } from "./env.js";
import logger from "../utils/logger.js";

const connectDatabase = async (): Promise<void> => {
  try {
    const connection = await mongoose.connect(env.MONGODB_URI);

    logger.divider();
    logger.success("MongoDB Connected");
    logger.info(`Database : ${connection.connection.name}`);
    logger.divider();

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB Disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      logger.success("MongoDB Reconnected");
    });

    mongoose.connection.on("error", (err) => {
      logger.error("❌ MongoDB Error: " + err.message);
    });
  } catch (error) {
    logger.error("❌ MongoDB Connection Failed");

    if (error instanceof Error) {
      logger.error(error.message);
    }

    process.exit(1);
  }
};

export default connectDatabase;
