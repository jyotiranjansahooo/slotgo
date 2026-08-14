import { Request, Response, NextFunction } from "express";

import ApiError from "../utils/ApiError.js";

const adminMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    throw new ApiError(
      401,
      "Authentication required.",
    );
  }

  if (req.user.role !== "admin") {
    throw new ApiError(
      403,
      "Admin access required.",
    );
  }

  next();
};

export default adminMiddleware;