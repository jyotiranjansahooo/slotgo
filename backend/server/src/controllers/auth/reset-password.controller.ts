import type {
  Request,
  Response,
} from "express";

import asyncHandler from "../../utils/asyncHandler.js";

import {
  resetPassword,
} from "../../services/auth/reset-password.service.js";

export const resetPasswordController =
  asyncHandler(
    async (
      req: Request,
      res: Response,
    ) => {
      const result =
        await resetPassword({
          email: req.body.email,
          newPassword: req.body.newPassword,
          confirmPassword:
            req.body.confirmPassword,
        });

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: result.message,
        data: result,
      });
    },
  );