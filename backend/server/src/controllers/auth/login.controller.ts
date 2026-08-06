import { Request, Response } from "express";

import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { loginService } from "../../services/auth/login.service.js";

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await loginService(req.body);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json(
      new ApiResponse(
        200,
        "Login successful",
        {
          user: result.user,
          accessToken: result.accessToken,
        }
      )
    );
  }
);