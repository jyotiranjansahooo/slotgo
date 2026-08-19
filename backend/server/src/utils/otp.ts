import crypto from "crypto";

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

export const generateOtp = (): string => {
  const max = 10 ** OTP_LENGTH;

  return crypto
    .randomInt(0, max)
    .toString()
    .padStart(OTP_LENGTH, "0");
};

export const hashOtp = (otp: string): string => {
  return crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
};

export const getOtpExpiry = (): Date => {
  return new Date(
    Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
  );
};

export const verifyOtp = (
  otp: string,
  hashedOtp: string,
): boolean => {
  if (!/^\d{6}$/.test(otp)) {
    return false;
  }

  if (!/^[a-f0-9]{64}$/i.test(hashedOtp)) {
    return false;
  }

  const hashedInput = hashOtp(otp);

  const inputBuffer = Buffer.from(hashedInput, "hex");
  const storedBuffer = Buffer.from(hashedOtp, "hex");

  if (inputBuffer.length !== storedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    inputBuffer,
    storedBuffer,
  );
};

export const getOtpExpiryMinutes = (): number => {
  return OTP_EXPIRY_MINUTES;
};

export const getMaxOtpAttempts = (): number => {
  return MAX_OTP_ATTEMPTS;
};