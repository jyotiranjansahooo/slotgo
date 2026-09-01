import { Request, Response } from "express";

import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

import { forgotPassword } from "../../services/auth/forgot-password.service.js";

export const forgotPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await forgotPassword({
      email: req.body.email,
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          result.message,
        ),
      );
  },
);