import bcrypt from "bcrypt";
import ApiError from "../../utils/ApiError.js";
import User from "../../models/User.js";
export const resetPassword = async ({ email, newPassword, confirmPassword, }) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (newPassword !== confirmPassword) {
        throw new ApiError(400, "New password and confirm password do not match.");
    }
    if (newPassword.length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters long.");
    }
    const user = await User.findOne({
        email: normalizedEmail,
    }).select("+password +passwordResetVerifiedAt +refreshToken");
    if (!user) {
        throw new ApiError(400, "Unable to reset password.");
    }
    if (user.authProvider === "google") {
        throw new ApiError(400, "This account uses Google sign-in. Please continue with Google.");
    }
    if (!user.isVerified) {
        throw new ApiError(400, "Please verify your email before resetting your password.");
    }
    if (!user.passwordResetVerifiedAt) {
        throw new ApiError(400, "Please verify the password reset OTP first.");
    }
    const verificationAge = Date.now() - user.passwordResetVerifiedAt.getTime();
    const RESET_VERIFICATION_WINDOW = 10 * 60 * 1000;
    if (verificationAge > RESET_VERIFICATION_WINDOW) {
        user.passwordResetVerifiedAt = undefined;
        await user.save();
        throw new ApiError(400, "Password reset verification has expired. Please request a new OTP.");
    }
    if (user.password) {
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            throw new ApiError(400, "New password must be different from your current password.");
        }
    }
    user.password = newPassword;
    user.refreshToken = "";
    user.passwordResetVerifiedAt = undefined;
    user.passwordResetOtpHash = "";
    user.passwordResetOtpExpiresAt = undefined;
    user.passwordResetOtpAttempts = 0;
    await user.save();
    return {
        email: normalizedEmail,
        message: "Password reset successfully. Please login with your new password.",
    };
};
//# sourceMappingURL=reset-password.service.js.map