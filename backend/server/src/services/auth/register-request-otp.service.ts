import bcrypt from "bcrypt";

import ApiError from "../../utils/ApiError.js";

import User from "../../models/User.js";

import PendingRegistration from "../../models/PendingRegistration.js";

import { generateOtp, hashOtp } from "../../utils/otp.js";

import { sendVerificationOtp } from "../email/email.service.js";

export interface RegisterRequestData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: "driver" | "parkingOwner";
}

export const registerRequestOtp = async (
  data: RegisterRequestData,
) => {
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    password,
    role,
  } = data;

  const normalizedEmail = email.toLowerCase().trim();

  const normalizedPhoneNumber = phoneNumber.trim();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw new ApiError(
      409,
      "An account with this email already exists.",
    );
  }

  const existingPhone = await User.findOne({
    phoneNumber: normalizedPhoneNumber,
  });

  if (existingPhone) {
    throw new ApiError(
      409,
      "An account with this phone number already exists.",
    );
  }

  const existingPending =
    await PendingRegistration.findOne({
      email: normalizedEmail,
    }).select("+lastOtpSentAt");

  if (existingPending) {
    const elapsed =
      Date.now() -
      existingPending.lastOtpSentAt.getTime();

    if (elapsed < 60_000) {
      throw new ApiError(
        429,
        "Please wait before requesting another OTP.",
      );
    }
  }

  const otp = generateOtp();

  const otpHash = hashOtp(otp);

  const passwordHash = await bcrypt.hash(
    password,
    12,
  );

  const otpExpiresAt = new Date(
    Date.now() + 10 * 60 * 1000,
  );

  await PendingRegistration.findOneAndUpdate(
    {
      email: normalizedEmail,
    },
    {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      phoneNumber: normalizedPhoneNumber,

      passwordHash,

      role,
      otpHash,
      otpExpiresAt,
      otpAttempts: 0,
      lastOtpSentAt: new Date(),
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );

  try {
    await sendVerificationOtp(
      normalizedEmail,
      otp,
    );
  } catch {
    throw new ApiError(
      500,
      "Unable to send verification email. Please try again.",
    );
  }

  return {
    email: normalizedEmail,
    message:
      "Verification OTP sent to your email.",
  };
};