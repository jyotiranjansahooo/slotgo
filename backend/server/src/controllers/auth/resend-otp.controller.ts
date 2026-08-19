import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import {
  resendOtpService,
  type ResendOtpData,
} from "../../services/auth/resend-otp.service.js";

export const resendOtpController = asyncHandler(
  async (req, res) => {
    const data = req.body as ResendOtpData;

    const result = await resendOtpService(data);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          email: result.email,
        },
        result.message,
      ),
    );
  },
);