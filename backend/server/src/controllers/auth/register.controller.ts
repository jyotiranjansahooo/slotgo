import { Request, Response } from "express";

import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { registerService } from "../../services/auth/register.service.js";

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
      new ApiResponse(
        201,
        {
          user: {
            id: result.user._id.toString(),
            firstName: result.user.name.first,
            lastName: result.user.name.last,
            email: result.user.email,
            phoneNumber: result.user.phoneNumber,
            role: result.user.role,
          },

          accessToken: result.accessToken,
        },
        "User registered successfully",
      ),
    );
  },
);