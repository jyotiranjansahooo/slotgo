import ApiError from "../../utils/ApiError.js";
import User from "../../models/User.js";
import { generateOtp, getOtpExpiry, hashOtp } from "../../utils/otp.js";
import { sendVerificationOtp } from "../email/email.service.js";

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  role: "driver" | "parkingOwner";
}

export const registerService = async (data: RegisterData) => {
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    password,
    confirmPassword,
    role,
  } = data;

  if (password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    $or: [{ email: normalizedEmail }, { phoneNumber }],
  }).select(
    "+verificationOtpHash +verificationOtpExpiresAt +verificationOtpAttempts",
  );

  if (existingUser) {
    if (existingUser.email === normalizedEmail) {
      if (existingUser.isVerified) {
        throw new ApiError(409, "An account with this email already exists");
      }

      const otp = generateOtp();

      existingUser.verificationOtpHash = hashOtp(otp);
      existingUser.verificationOtpExpiresAt = getOtpExpiry();
      existingUser.verificationOtpAttempts = 0;

      await existingUser.save();

      await sendVerificationOtp(normalizedEmail, otp);

      return {
        requiresVerification: true,
        email: normalizedEmail,
        message: "A new verification code has been sent to your email",
      };
    }

    throw new ApiError(409, "An account with this phone number already exists");
  }

  const otp = generateOtp();

  const user = new User({
    name: {
      first: firstName.trim(),
      last: lastName.trim(),
    },

    email: normalizedEmail,

    phoneNumber,

    password,

    authProvider: "local",

    role,

    isVerified: false,

    verificationOtpHash: hashOtp(otp),

    verificationOtpExpiresAt: getOtpExpiry(),

    verificationOtpAttempts: 0,

    isActive: true,
  });

  await user.save();

  try {
    await sendVerificationOtp(normalizedEmail, otp);
  } catch (error) {
    await User.findByIdAndDelete(user._id);

    throw new ApiError(
      500,
      "Unable to send verification email. Please try again.",
    );
  }

  return {
    requiresVerification: true,
    email: normalizedEmail,
    message: "Verification code sent to your email",
  };
};
