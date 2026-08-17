import { Request, Response, NextFunction } from "express";

import ApiError from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/jwt.js";
import User from "../models/User.js";

const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication required.");
    }

    const token = authorization.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "Access token is required.");
    }

    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.userId).select(
      "_id name email phoneNumber role isActive isVerified",
    );

    if (!user) {
      throw new ApiError(401, "User account not found.");
    }

    if (!user.isActive) {
      throw new ApiError(403, "Your account has been deactivated.");
    }

    req.user = user;
    console.log("========== AUTH DEBUG ==========");
    console.log("JWT userId:", decoded.userId);
    console.log("Database user _id:", user._id.toString());
    console.log("Database user role:", user.role);
    console.log("Database user email:", user.email);
    console.log("================================");

    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
