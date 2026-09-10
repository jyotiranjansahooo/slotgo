import ApiError from "../../utils/ApiError.js";

import User from "../../models/User.js";

import PendingRegistration from "../../models/PendingRegistration.js";

import { verifyOtp, getMaxOtpAttempts } from "../../utils/otp.js";

import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";

export interface VerifyOtpData {
  email: string;
  otp: string;
}

export const verifyOtpService = async ({ email, otp }: VerifyOtpData) => {
  const normalizedEmail = email.trim().toLowerCase();

  const pendingRegistration = await PendingRegistration.findOne({
    email: normalizedEmail,
  }).select("+otpHash +otpExpiresAt +otpAttempts +passwordHash");

  if (!pendingRegistration) {
    throw new ApiError(
      404,
      "Registration request not found. Please register again.",
    );
  }

  if (pendingRegistration.otpExpiresAt.getTime() <= Date.now()) {
    await PendingRegistration.findByIdAndDelete(pendingRegistration._id);

    throw new ApiError(
      400,
      "Verification code has expired. Please register again.",
    );
  }

  const maxAttempts = getMaxOtpAttempts();

  if (pendingRegistration.otpAttempts >= maxAttempts) {
    throw new ApiError(
      429,
      "Too many incorrect attempts. Please request a new verification code.",
    );
  }

  const isValidOtp = verifyOtp(otp, pendingRegistration.otpHash);

  if (!isValidOtp) {
    pendingRegistration.otpAttempts += 1;

    if (pendingRegistration.otpAttempts >= maxAttempts) {
      await PendingRegistration.findByIdAndDelete(pendingRegistration._id);

      throw new ApiError(
        429,
        "Too many incorrect attempts. Please request a new verification code.",
      );
    }

    await pendingRegistration.save();

    const remainingAttempts = maxAttempts - pendingRegistration.otpAttempts;

    throw new ApiError(
      400,
      `Invalid verification code. ${remainingAttempts} attempt${
        remainingAttempts === 1 ? "" : "s"
      } remaining.`,
    );
  }

  const existingUser = await User.findOne({
    $or: [
      {
        email: pendingRegistration.email,
      },
      {
        phoneNumber: pendingRegistration.phoneNumber,
      },
    ],
  });

  if (existingUser) {
    await PendingRegistration.findByIdAndDelete(pendingRegistration._id);

    throw new ApiError(
      409,
      "An account with this email or phone number already exists.",
    );
  }

  const user = new User({
    name: {
      first: pendingRegistration.firstName,
      last: pendingRegistration.lastName,
    },

    email: pendingRegistration.email,

    phoneNumber: pendingRegistration.phoneNumber,

    password: pendingRegistration.passwordHash,

    authProvider: "local",

    role: pendingRegistration.role,

    isVerified: true,

    verifiedAt: new Date(),

    verificationOtpHash: "",

    verificationOtpExpiresAt: undefined,

    verificationOtpAttempts: 0,

    isActive: true,

    lastLogin: new Date(),

    loginCount: 1,
  });

  await user.save();

  await PendingRegistration.findByIdAndDelete(pendingRegistration._id);

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
