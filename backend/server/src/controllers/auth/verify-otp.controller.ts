import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import {
  verifyOtpService,
  type VerifyOtpData,
} from "../../services/auth/verify-otp.service.js";

export const verifyOtpController = asyncHandler(async (req, res) => {
  const data = req.body as VerifyOtpData;

  const result = await verifyOtpService(data);

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: result.user,
        accessToken: result.accessToken,
      },
      "Email verified successfully",
    ),
  );
});