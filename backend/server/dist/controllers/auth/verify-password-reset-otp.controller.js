import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { verifyPasswordResetOtp } from "../../services/auth/verify-password-reset-otp.service.js";
export const verifyPasswordResetOtpController = asyncHandler(async (req, res) => {
    const result = await verifyPasswordResetOtp({
        email: req.body.email,
        otp: req.body.otp,
    });
    res
        .status(200)
        .json(new ApiResponse(200, result, "Password reset OTP verified successfully."));
});
//# sourceMappingURL=verify-password-reset-otp.controller.js.map