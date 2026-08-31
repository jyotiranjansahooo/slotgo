import ApiError from "../../utils/ApiError.js";

import User from "../../models/User.js";
import Parking from "../../models/Parking.js";

import {
  generateOtp,
  hashOtp,
  getOtpExpiry,
  getMaxOtpAttempts,
  verifyOtp,
} from "../../utils/otp.js";

import { sendVerificationOtp } from "../email/email.service.js";

export type ParkingAction = "temporary-close" | "delete";

const ACTION_LABELS: Record<ParkingAction, string> = {
  "temporary-close": "temporarily close your parking",
  delete: "delete your parking",
};

/*
|--------------------------------------------------------------------------
| REQUEST PARKING ACTION OTP
|--------------------------------------------------------------------------
*/

export const requestParkingActionVerification = async ({
  ownerId,
  parkingId,
  action,
}: {
  ownerId: string;
  parkingId: string;
  action: ParkingAction;
}) => {
  /*
   * Find the parking and make sure it belongs
   * to the logged-in owner.
   */

  const parking = await Parking.findOne({
    _id: parkingId,
    ownerId,
    isActive: true,
  });

  if (!parking) {
    throw new ApiError(
      404,
      "Parking not found or you are not authorized to modify it.",
    );
  }

  /*
   * Temporary close should only be requested
   * when the parking is currently open.
   */

  if (action === "temporary-close" && parking.isTemporarilyClosed) {
    throw new ApiError(400, "This parking is already temporarily closed.");
  }

  /*
   * Find the owner.
   */

  const owner = await User.findById(ownerId).select(
    "+actionVerificationOtpHash " +
      "+actionVerificationOtpExpiresAt " +
      "+actionVerificationOtpAttempts " +
      "+actionVerificationType " +
      "+actionVerificationLastSentAt",
  );

  if (!owner) {
    throw new ApiError(404, "Owner account not found.");
  }

  /*
   * The owner must have a verified email
   * before performing sensitive actions.
   */

  if (!owner.isVerified) {
    throw new ApiError(
      403,
      "Please verify your email before performing this action.",
    );
  }

  /*
   * Prevent OTP spam.
   */

  const lastSentAt = owner.actionVerificationLastSentAt;

  if (lastSentAt) {
    const elapsed = Date.now() - lastSentAt.getTime();

    if (elapsed < 60_000) {
      const remainingSeconds = Math.ceil((60_000 - elapsed) / 1000);

      throw new ApiError(
        429,
        `Please wait ${remainingSeconds} seconds before requesting another OTP.`,
      );
    }
  }

  /*
   * Generate a fresh OTP.
   */

  const otp = generateOtp();

  /*
   * Store only the hash.
   */

  owner.actionVerificationOtpHash = hashOtp(otp);

  owner.actionVerificationOtpExpiresAt = getOtpExpiry();

  owner.actionVerificationOtpAttempts = 0;

  owner.actionVerificationType = action;

  owner.actionVerificationLastSentAt = new Date();

  await owner.save();

  /*
   * Send OTP to the verified email.
   */

  try {
    await sendVerificationOtp(owner.email, otp);
  } catch (error) {
    /*
     * Do not leave a valid OTP in the database
     * if the email could not be sent.
     */

    owner.actionVerificationOtpHash = "";

    owner.actionVerificationOtpExpiresAt = undefined;

    owner.actionVerificationOtpAttempts = 0;

    owner.actionVerificationType = undefined;

    await owner.save();

    console.error("Parking action verification email failed:", error);

    throw new ApiError(
      500,
      "Failed to send verification code. Please try again.",
    );
  }

  return {
    email: owner.email,
    action,
    expiresInMinutes: 10,
    message: `Verification code sent to your email to ${ACTION_LABELS[action]}.`,
  };
};

/*
|--------------------------------------------------------------------------
| VERIFY PARKING ACTION OTP
|--------------------------------------------------------------------------
*/

export const verifyParkingActionVerification = async ({
  ownerId,
  action,
  otp,
}: {
  ownerId: string;
  action: ParkingAction;
  otp: string;
}) => {
  const owner = await User.findById(ownerId).select(
    "+actionVerificationOtpHash " +
      "+actionVerificationOtpExpiresAt " +
      "+actionVerificationOtpAttempts " +
      "+actionVerificationType",
  );

  if (!owner) {
    throw new ApiError(404, "Owner account not found.");
  }

  /*
   * No OTP.
   */

  if (!owner.actionVerificationOtpHash) {
    throw new ApiError(
      400,
      "No verification code found. Please request a new code.",
    );
  }

  /*
   * Action must match.
   *
   * A DELETE OTP cannot be used for
   * temporary close and vice versa.
   */

  if (owner.actionVerificationType !== action) {
    throw new ApiError(
      400,
      "This verification code is not valid for this action. Please request a new code.",
    );
  }

  /*
   * Check expiry.
   */

  if (!owner.actionVerificationOtpExpiresAt) {
    throw new ApiError(
      400,
      "Verification code has expired. Please request a new code.",
    );
  }

  if (owner.actionVerificationOtpExpiresAt.getTime() <= Date.now()) {
    clearActionVerificationOtp(owner);

    await owner.save();

    throw new ApiError(
      400,
      "Verification code has expired. Please request a new code.",
    );
  }

  /*
   * Check attempts.
   */

  const maxAttempts = getMaxOtpAttempts();

  if (owner.actionVerificationOtpAttempts >= maxAttempts) {
    clearActionVerificationOtp(owner);

    await owner.save();

    throw new ApiError(
      429,
      "Too many incorrect attempts. Please request a new verification code.",
    );
  }

  /*
   * Validate OTP format/hash.
   */

  const isValid = verifyOtp(otp, owner.actionVerificationOtpHash);

  if (!isValid) {
    owner.actionVerificationOtpAttempts += 1;

    if (owner.actionVerificationOtpAttempts >= maxAttempts) {
      clearActionVerificationOtp(owner);

      await owner.save();

      throw new ApiError(
        429,
        "Too many incorrect attempts. Please request a new verification code.",
      );
    }

    await owner.save();

    const remainingAttempts = maxAttempts - owner.actionVerificationOtpAttempts;

    throw new ApiError(
      400,
      `Invalid verification code. ${remainingAttempts} attempt${
        remainingAttempts === 1 ? "" : "s"
      } remaining.`,
    );
  }

  /*
   * OTP is valid.
   *
   * Clear it immediately so it cannot
   * be reused.
   */

  clearActionVerificationOtp(owner);

  await owner.save();

  return true;
};

/*
|--------------------------------------------------------------------------
| CLEAR ACTION VERIFICATION OTP
|--------------------------------------------------------------------------
*/

function clearActionVerificationOtp(owner: any) {
  owner.actionVerificationOtpHash = "";

  owner.actionVerificationOtpExpiresAt = undefined;

  owner.actionVerificationOtpAttempts = 0;

  owner.actionVerificationType = undefined;
}
