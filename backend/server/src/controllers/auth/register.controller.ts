import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import {
  registerService,
  type RegisterData,
} from "../../services/auth/register.service.js";

export const registerController = asyncHandler(async (req, res) => {
  const data = req.body as RegisterData;

  const result = await registerService(data);

  res.status(201).json(
    new ApiResponse(
      201,
      {
        requiresVerification: result.requiresVerification,
        email: result.email,
      },
      result.message,
    ),
  );
});