import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

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
  let message = "Something went wrong. Please try again.";
  let errors: unknown[] = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof mongoose.Error.ValidationError) {

    statusCode = 400;

    const validationMessages = Object.values(err.errors)
      .map((validationError) => validationError.message)
      .filter(Boolean);

    const hasFacilityError = validationMessages.some((errorMessage) =>
      errorMessage.toLowerCase().includes("facilities"),
    );

    if (hasFacilityError) {
      message =
        "Some selected parking facilities are invalid. Please review your facility selections and try again.";
    } else {
      message =
        validationMessages[0] ||
        "Some parking information is invalid. Please review the form and try again.";
    }

    errors = validationMessages;
  } else if (err instanceof mongoose.Error.CastError) {

  /*
   * ------------------------------------------------------------
   * MONGOOSE CAST ERROR
   * ------------------------------------------------------------
   */
    statusCode = 400;

    message = "Some parking information is invalid. Please check your input.";
  } else if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: number }).code === 11000
  ) {
    statusCode = 409;

    message =
      "A parking with this information already exists. Please check your details.";
  } else {
    logger.error(`${req.method} ${req.originalUrl} -> ${err.message}`);
  }

  logger.error(`${req.method} ${req.originalUrl} -> ${err.message}`);

  res.status(statusCode).json(new ApiResponse(statusCode, errors, message));
};

export default errorMiddleware;
