import express, { Express } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import reviewRoutes from "./routes/review.routes.js";
import adminParkingRoutes from "./routes/admin/parking.routes.js";
import adminUserRoutes from "./routes/admin/user.routes.js";
import adminDashboardRoutes from "./routes/admin/dashboard.routes.js";
import parkingBookingBlockRoutes from "./routes/parking-booking-block.routes.js";
import vehicleRoutes from "./routes/vehicle.routes.js";

import { env } from "./config/env.js";
import routes from "./routes/index.js";
import notFoundMiddleware from "./middleware/notFound.middleware.js";
import errorMiddleware from "./middleware/error.middleware.js";

const app: Express = express();

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie Parser
app.use(cookieParser());

// Compression
app.use(compression());

// Logger
app.use(morgan("dev"));

// Routes
app.use("/api/v1", routes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/admin/parkings", adminParkingRoutes);
app.use("/api/v1/vehicles", vehicleRoutes);
app.use("/api/v1/admin/users", adminUserRoutes);
app.use("/api/v1/admin/dashboard", adminDashboardRoutes);
app.use("/api/v1/parking-booking-blocks", parkingBookingBlockRoutes);

// 404 Handler
app.use(notFoundMiddleware);

// Global Error Handler
app.use(errorMiddleware);

export default app;
