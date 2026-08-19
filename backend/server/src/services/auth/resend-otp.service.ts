import ApiError from "../../utils/ApiError.js";
import User from "../../models/User.js";
import { generateOtp, getOtpExpiry, hashOtp } from "../../utils/otp.js";
import { sendVerificationOtp } from "../email/email.service.js";

const RESEND_COOLDOWN_MS = 60 * 1000;

export interface ResendOtpData {
  email: string;
}

export const resendOtpService = async (data: ResendOtpData) => {
  const email = data.email.trim().toLowerCase();

  const user = await User.findOne({
    email,
  }).select(
    "+verificationOtpHash +verificationOtpExpiresAt +verificationOtpAttempts",
  );

  if (!user) {
    throw new ApiError(404, "Account not found");
  }

  if (user.isVerified) {
    throw new ApiError(400, "This account is already verified");
  }

  if (
    user.verificationOtpExpiresAt &&
    user.verificationOtpExpiresAt.getTime() > Date.now()
  ) {
    const lastSentAt = user.verificationOtpExpiresAt.getTime() - 10 * 60 * 1000;

    const elapsed = Date.now() - lastSentAt;

    if (elapsed < RESEND_COOLDOWN_MS) {
      const remainingSeconds = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);

      throw new ApiError(
        429,
        `Please wait ${remainingSeconds} seconds before requesting another code.`,
      );
    }
  }

  const otp = generateOtp();

  user.verificationOtpHash = hashOtp(otp);
  user.verificationOtpExpiresAt = getOtpExpiry();
  user.verificationOtpAttempts = 0;

  await user.save();

  try {
    await sendVerificationOtp(email, otp);
  } catch {
    user.verificationOtpHash = "";
    user.verificationOtpExpiresAt = undefined;
    user.verificationOtpAttempts = 0;

    await user.save();

    throw new ApiError(
      500,
      "Unable to send verification email. Please try again.",
    );
  }

  return {
    email,
    message: "A new verification code has been sent to your email",
  };
};
