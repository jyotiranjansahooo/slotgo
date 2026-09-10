import ApiError from "../../utils/ApiError.js";

import PendingRegistration from "../../models/PendingRegistration.js";

import { generateOtp, hashOtp } from "../../utils/otp.js";

import { sendVerificationOtp } from "../email/email.service.js";

const RESEND_COOLDOWN_MS = 60 * 1000;

export interface ResendOtpData {
  email: string;
}

export const resendOtpService = async (data: ResendOtpData) => {
  const email = data.email.trim().toLowerCase();

  const pendingRegistration = await PendingRegistration.findOne({
    email,
  }).select("+otpHash +otpExpiresAt +otpAttempts +lastOtpSentAt");

  if (!pendingRegistration) {
    throw new ApiError(
      404,
      "Registration request not found. Please register again.",
    );
  }

  const elapsed = Date.now() - pendingRegistration.lastOtpSentAt.getTime();

  if (elapsed < RESEND_COOLDOWN_MS) {
    const remainingSeconds = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);

    throw new ApiError(
      429,
      `Please wait ${remainingSeconds} seconds before requesting another code.`,
    );
  }

  const otp = generateOtp();

  const otpHash = hashOtp(otp);

  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  try {
    await sendVerificationOtp(email, otp);
  } catch {
    throw new ApiError(
      500,
      "Unable to send verification email. Please try again.",
    );
  }

  pendingRegistration.otpHash = otpHash;
  pendingRegistration.otpExpiresAt = otpExpiresAt;
  pendingRegistration.otpAttempts = 0;
  pendingRegistration.lastOtpSentAt = new Date();

  await pendingRegistration.save();

  return {
    email,
    message: "A new verification code has been sent to your email",
  };
};
