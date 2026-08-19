import ApiError from "../../utils/ApiError.js";
import User from "../../models/User.js";
import { verifyOtp, getMaxOtpAttempts } from "../../utils/otp.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";

export interface VerifyOtpData {
  email: string;
  otp: string;
}

export const verifyOtpService = async ({ email, otp }: VerifyOtpData) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select(
    "+verificationOtpHash +verificationOtpExpiresAt +verificationOtpAttempts +refreshToken",
  );

  if (!user) {
    throw new ApiError(404, "Account not found");
  }

  if (user.isVerified) {
    throw new ApiError(400, "Email is already verified");
  }

  if (!user.verificationOtpHash) {
    throw new ApiError(
      400,
      "No verification code found. Please request a new code.",
    );
  }

  if (!user.verificationOtpExpiresAt) {
    throw new ApiError(
      400,
      "Verification code has expired. Please request a new code.",
    );
  }

  if (user.verificationOtpExpiresAt.getTime() <= Date.now()) {
    user.verificationOtpHash = "";
    user.verificationOtpExpiresAt = undefined;
    user.verificationOtpAttempts = 0;

    await user.save();

    throw new ApiError(
      400,
      "Verification code has expired. Please request a new code.",
    );
  }

  const maxAttempts = getMaxOtpAttempts();

  if (user.verificationOtpAttempts >= maxAttempts) {
    throw new ApiError(
      429,
      "Too many incorrect attempts. Please request a new verification code.",
    );
  }

  const isValidOtp = verifyOtp(otp, user.verificationOtpHash);

  if (!isValidOtp) {
    user.verificationOtpAttempts += 1;

    if (user.verificationOtpAttempts >= maxAttempts) {
      user.verificationOtpHash = "";
      user.verificationOtpExpiresAt = undefined;

      await user.save();

      throw new ApiError(
        429,
        "Too many incorrect attempts. Please request a new verification code.",
      );
    }

    await user.save();

    const remainingAttempts = maxAttempts - user.verificationOtpAttempts;

    throw new ApiError(
      400,
      `Invalid verification code. ${remainingAttempts} attempt${
        remainingAttempts === 1 ? "" : "s"
      } remaining.`,
    );
  }

  user.isVerified = true;
  user.verifiedAt = new Date();

  user.verificationOtpHash = "";
  user.verificationOtpExpiresAt = undefined;
  user.verificationOtpAttempts = 0;

  user.lastLogin = new Date();
  user.loginCount += 1;

  const accessToken = generateAccessToken(user);

  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;

  await user.save();

  return {
    user: {
      id: user._id.toString(),
      firstName: user.name.first,
      lastName: user.name.last,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
    },
    accessToken,
    refreshToken,
  };
};
