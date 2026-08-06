import { Request, Response, NextFunction } from "express";

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

import userRepository from "../repositories/user.repository.js";
import { verifyAccessToken } from "../utils/jwt.js";

const authMiddleware = asyncHandler(
  async (
    req: Request,
    _res: Response,
    next: NextFunction
  ) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Access token is missing");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "Invalid access token");
    }

    const payload = verifyAccessToken(token);

    const user = await userRepository.findById(payload.userId);

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    if (!user.isActive) {
      throw new ApiError(403, "Account is inactive");
    }

    req.user = user;

    next();
  }
);

export default authMiddleware;