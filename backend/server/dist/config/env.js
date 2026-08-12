import dotenv from "dotenv";
import { z } from "zod";
import logger from "../utils/logger.js";
dotenv.config();
const envSchema = z.object({
    PORT: z.string().default("5000"),
    NODE_ENV: z.enum(["development", "production", "test"]),
    CLIENT_URL: z.string().url(),
    MONGODB_URI: z.string().min(1),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    logger.error("❌ Invalid Environment Variables");
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
}
export const env = parsed.data;
//# sourceMappingURL=env.js.map