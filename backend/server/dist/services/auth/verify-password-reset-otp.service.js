import ApiError from "../../utils/ApiError.js";
import User from "../../models/User.js";
import { verifyOtp, getMaxOtpAttempts } from "../../utils/otp.js";
export const verifyPasswordResetOtp = async ({ email, otp, }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({
        email: normalizedEmail,
    }).select("+passwordResetOtpHash +passwordResetOtpExpiresAt +passwordResetOtpAttempts +passwordResetVerifiedAt");
    if (!user) {
        throw new ApiError(400, "Invalid email or verification code.");
    }
    if (user.authProvider === "google") {
        throw new ApiError(400, "This account uses Google sign-in. Please continue with Google.");
    }
    if (!user.isVerified) {
        throw new ApiError(400, "Please verify your email before resetting your password.");
    }
    if (!user.passwordResetOtpHash) {
        throw new ApiError(400, "No password reset code found. Please request a new code.");
    }
    if (!user.passwordResetOtpExpiresAt) {
        throw new ApiError(400, "Password reset code has expired. Please request a new code.");
    }
    if (user.passwordResetOtpExpiresAt.getTime() <= Date.now()) {
        user.passwordResetOtpHash = "";
        user.passwordResetOtpExpiresAt = undefined;
        user.passwordResetOtpAttempts = 0;
        user.passwordResetVerifiedAt = undefined;
        await user.save();
        throw new ApiError(400, "Password reset code has expired. Please request a new code.");
    }
    const maxAttempts = getMaxOtpAttempts();
    if (user.passwordResetOtpAttempts >= maxAttempts) {
        throw new ApiError(429, "Too many incorrect attempts. Please request a new password reset code.");
    }
    const isValidOtp = verifyOtp(otp, user.passwordResetOtpHash);
    if (!isValidOtp) {
        user.passwordResetOtpAttempts += 1;
        if (user.passwordResetOtpAttempts >= maxAttempts) {
            user.passwordResetOtpHash = "";
            user.passwordResetOtpExpiresAt = undefined;
            user.passwordResetOtpAttempts = 0;
            user.passwordResetVerifiedAt = undefined;
            await user.save();
            throw new ApiError(429, "Too many incorrect attempts. Please request a new password reset code.");
        }
        await user.save();
        const remainingAttempts = maxAttempts - user.passwordResetOtpAttempts;
        throw new ApiError(400, `Invalid verification code. ${remainingAttempts} attempt${remainingAttempts === 1 ? "" : "s"} remaining.`);
    }
    user.passwordResetVerifiedAt = new Date();
    user.passwordResetOtpHash = "";
    user.passwordResetOtpExpiresAt = undefined;
    user.passwordResetOtpAttempts = 0;
    await user.save();
    return {
        email: normalizedEmail,
        verified: true,
        message: "OTP verified successfully. You can now create a new password.",
    };
};
//# sourceMappingURL=verify-password-reset-otp.service.js.map