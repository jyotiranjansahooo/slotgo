import ApiError from "../../utils/ApiError.js";
import User from "../../models/User.js";
const RESET_VERIFICATION_WINDOW = 10 * 60 * 1000;
export const resetPassword = async ({ email, newPassword, confirmPassword, }) => {
    const normalizedEmail = email.trim().toLowerCase();
    /*
     * Validate password
     */
    if (newPassword.length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters long.");
    }
    if (newPassword !== confirmPassword) {
        throw new ApiError(400, "New password and confirm password do not match.");
    }
    /*
     * Find user
     */
    const user = await User.findOne({
        email: normalizedEmail,
    }).select("+password +passwordResetVerifiedAt");
    if (!user) {
        throw new ApiError(400, "Unable to reset password.");
    }
    /*
     * Google accounts cannot use local password reset.
     */
    if (user.authProvider === "google") {
        throw new ApiError(400, "This account uses Google sign-in. Please continue with Google.");
    }
    /*
     * Email must already be verified.
     */
    if (!user.isVerified) {
        throw new ApiError(400, "Please verify your email before resetting your password.");
    }
    /*
     * OTP must have been verified first.
     */
    if (!user.passwordResetVerifiedAt) {
        throw new ApiError(400, "Please verify the password reset OTP first.");
    }
    /*
     * OTP verification is valid for 10 minutes.
     */
    const verificationAge = Date.now() -
        user.passwordResetVerifiedAt.getTime();
    if (verificationAge >
        RESET_VERIFICATION_WINDOW) {
        user.passwordResetVerifiedAt =
            undefined;
        await user.save();
        throw new ApiError(400, "Password reset authorization has expired. Please verify the OTP again.");
    }
    /*
     * Update password.
     *
     * The User pre-save hook will bcrypt-hash it.
     */
    user.password = newPassword;
    /*
     * Consume the OTP verification.
     *
     * This prevents the same OTP verification
     * from being reused.
     */
    user.passwordResetVerifiedAt =
        undefined;
    await user.save();
    return {
        email: normalizedEmail,
        message: "Password reset successfully. You can now login with your new password.",
    };
};
//# sourceMappingURL=reset-password.service.js.map