import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import logger from "../utils/logger.js";

const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors: unknown[] = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }

  logger.error(`${req.method} ${req.originalUrl} -> ${message}`);

  res.status(statusCode).json(new ApiResponse(statusCode, message, errors));
};

export default errorMiddleware;
