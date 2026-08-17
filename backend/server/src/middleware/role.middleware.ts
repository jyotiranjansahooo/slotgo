import { Request, Response, NextFunction } from "express";

import ApiError from "../utils/ApiError.js";

import { UserRole } from "../constants/roles.js";

const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required.");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        403,
        "You do not have permission to perform this action.",
      );
    }

    next();
  };
};

export default requireRole;
