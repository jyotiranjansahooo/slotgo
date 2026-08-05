import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError.js";

const notFoundMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(new ApiError(404, `sorry route ${req.originalUrl} not found`));
};

export default notFoundMiddleware;
