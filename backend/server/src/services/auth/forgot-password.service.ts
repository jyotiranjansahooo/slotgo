import ApiError from "../../utils/ApiError.js";
import User from "../../models/User.js";

import {
  generateOtp,
  hashOtp,
  getOtpExpiry,
} from "../../utils/otp.js";

import {
  sendVerificationOtp,
} from "../email/email.service.js";

export interface ForgotPasswordData {
  email: string;
}

export const forgotPassword = async ({
  email,
}: ForgotPasswordData) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select(
    "+passwordResetOtpHash +passwordResetOtpExpiresAt +passwordResetOtpAttempts",
  );

  /*
   * Do not reveal whether an email exists.
   *
   * This prevents account enumeration.
   */

  if (!user) {
    return {
      email: normalizedEmail,
      message:
        "If an account exists with this email, a password reset OTP has been sent.",
    };
  }

  /*
   * Google accounts do not have a local password.
   */

  if (user.authProvider === "google") {
    throw new ApiError(
      400,
      "This account uses Google sign-in. Please continue with Google.",
    );
  }

  /*
   * Account must be verified before password reset.
   */

  if (!user.isVerified) {
    throw new ApiError(
      400,
      "Please verify your email before resetting your password.",
    );
  }

  /*
   * Prevent OTP spam.
   *
   * We use the OTP expiry timestamp as the reset window,
   * while the actual resend cooldown is handled separately
   * using the last OTP creation time.
   */

  if (
    user.passwordResetOtpExpiresAt &&
    user.passwordResetOtpExpiresAt.getTime() >
      Date.now() - 60_000
  ) {
    const otpAge =
      user.passwordResetOtpExpiresAt.getTime() -
      Date.now();

    /*
     * If the existing OTP was created less than
     * 9 minutes ago, do not send another immediately.
     */

    if (otpAge > 9 * 60 * 1000) {
      throw new ApiError(
        429,
        "Please wait before requesting another OTP.",
      );
    }
  }

  /*
   * Generate a new 6-digit OTP.
   */

  const otp = generateOtp();

  /*
   * Never store the plain OTP.
   */

  const otpHash = hashOtp(otp);

  /*
   * Store OTP securely.
   */

  user.passwordResetOtpHash = otpHash;
  user.passwordResetOtpExpiresAt = getOtpExpiry();
  user.passwordResetOtpAttempts = 0;
  user.passwordResetVerifiedAt = undefined;

  await user.save();

  /*
   * Send OTP to the user's registered email.
   */

  try {
    await sendVerificationOtp(
      normalizedEmail,
      otp,
    );
  } catch (error) {
    /*
     * If email delivery fails, clear the reset OTP
     * so the unusable OTP cannot remain active.
     */

    user.passwordResetOtpHash = "";
    user.passwordResetOtpExpiresAt = undefined;
    user.passwordResetOtpAttempts = 0;

    await user.save();

    console.error(
      "Password reset OTP email failed:",
      error,
    );

    throw new ApiError(
      500,
      "Unable to send password reset OTP. Please try again.",
    );
  }

  return {
    email: normalizedEmail,
    message:
      "If an account exists with this email, a password reset OTP has been sent.",
  };
};