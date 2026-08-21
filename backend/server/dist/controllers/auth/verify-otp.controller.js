import { verifyOtpService } from "../../services/auth/verify-otp.service.js";
export const verifyOtpController = async (req, res) => {
    const result = await verifyOtpService(req.body);
    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Email verified successfully",
        data: {
            user: result.user,
            accessToken: result.accessToken,
        },
    });
};
//# sourceMappingURL=verify-otp.controller.js.map