import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import logger from "../utils/logger.js";
const errorMiddleware = (err, req, res, _next) => {
    let statusCode = 500;
    let message = "Internal Server Error";
    let errors = [];
    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
        errors = err.errors;
    }
    else {
        logger.error(`${req.method} ${req.originalUrl} -> ${err.message}`);
        if (process.env.NODE_ENV !== "production") {
            message = err.message;
        }
    }
    logger.error(`${req.method} ${req.originalUrl} -> ${message}`);
    res.status(statusCode).json(new ApiResponse(statusCode, errors, message));
};
export default errorMiddleware;
//# sourceMappingURL=error.middleware.js.map