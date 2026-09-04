import asyncHandler from "../../utils/asyncHandler.js";
import { verifyPasswordResetOtp, } from "../../services/auth/verify-password-reset-otp.service.js";
export const verifyPasswordResetOtpController = asyncHandler(async (req, res) => {
    const result = await verifyPasswordResetOtp({
        email: req.body.email,
        otp: req.body.otp,
    });
    res.status(200).json({
        success: true,
        statusCode: 200,
        message: result.message,
        data: result,
    });
});
//# sourceMappingURL=verify-password-reset-otp.controller.js.map