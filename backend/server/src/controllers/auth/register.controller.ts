import asyncHandler from "../../utils/asyncHandler.js";

import ApiResponse from "../../utils/ApiResponse.js";

import {
  registerRequestOtp,
  type RegisterRequestData,
} from "../../services/auth/register-request-otp.service.js";

export const registerController = asyncHandler(async (req, res) => {
  const data = req.body as RegisterRequestData;

  const result = await registerRequestOtp(data);

  res.status(201).json(
    new ApiResponse(
      201,
      {
        email: result.email,
      },
      result.message,
    ),
  );
});
