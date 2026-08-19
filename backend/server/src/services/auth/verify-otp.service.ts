import ApiError from "../../utils/ApiError.js";
import User from "../../models/User.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import { verifyOtp, getMaxOtpAttempts } from "../../utils/otp.js";

export interface VerifyOtpData {
  email: string;
  otp: string;
}

export const verifyOtpService = async (data: VerifyOtpData) => {
  const email = data.email.trim().toLowerCase();
  const otp = data.otp.trim();

  const user = await User.findOne({
    email,
  }).select(
    "+verificationOtpHash +verificationOtpExpiresAt +verificationOtpAttempts +refreshToken",
  );

  if (!user) {
    throw new ApiError(404, "Account not found");
  }

  if (user.isVerified) {
    throw new ApiError(400, "This account is already verified");
  }

  if (!user.verificationOtpHash) {
    throw new ApiError(
      400,
      "Verification code not found. Please request a new code.",
    );
  }

  if (
    !user.verificationOtpExpiresAt ||
    user.verificationOtpExpiresAt.getTime() < Date.now()
  ) {
    user.verificationOtpHash = "";
    user.verificationOtpExpiresAt = undefined;
    user.verificationOtpAttempts = 0;

    await user.save();

    throw new ApiError(
      400,
      "Verification code has expired. Please request a new code.",
    );
  }

  if (user.verificationOtpAttempts >= getMaxOtpAttempts()) {
    user.verificationOtpHash = "";
    user.verificationOtpExpiresAt = undefined;
    user.verificationOtpAttempts = 0;

    await user.save();

    throw new ApiError(
      429,
      "Too many verification attempts. Please request a new code.",
    );
  }

  if (!/^\d{6}$/.test(otp)) {
    user.verificationOtpAttempts += 1;

    await user.save();

    throw new ApiError(400, "Verification code must contain 6 digits");
  }

  const isValid = verifyOtp(otp, user.verificationOtpHash);

  if (!isValid) {
    user.verificationOtpAttempts += 1;

    await user.save();

    const attemptsRemaining = Math.max(
      0,
      getMaxOtpAttempts() - user.verificationOtpAttempts,
    );

    if (attemptsRemaining === 0) {
      user.verificationOtpHash = "";
      user.verificationOtpExpiresAt = undefined;
      user.verificationOtpAttempts = 0;

      await user.save();

      throw new ApiError(
        429,
        "Too many verification attempts. Please request a new code.",
      );
    }

    throw new ApiError(
      400,
      `Invalid verification code. ${attemptsRemaining} attempt${
        attemptsRemaining === 1 ? "" : "s"
      } remaining.`,
    );
  }

  user.isVerified = true;
  user.verifiedAt = new Date();

  user.verificationOtpHash = "";
  user.verificationOtpExpiresAt = undefined;
  user.verificationOtpAttempts = 0;

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  user.loginCount += 1;

  await user.save();

  return {
    user: {
      id: user._id.toString(),
      firstName: user.name.first,
      lastName: user.name.last,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
    },

    accessToken,

    refreshToken,
  };
};
