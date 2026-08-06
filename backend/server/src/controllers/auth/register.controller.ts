import { Request, Response } from "express";

import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { registerService } from "../../services/auth/register.service.js";
import { AUTH } from "../../constants/auth.js";

export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await registerService(req.body);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json(
      new ApiResponse(201, "User registered successfully", {
        user: result.user,
        accessToken: result.accessToken,
      })
    );
  }
);