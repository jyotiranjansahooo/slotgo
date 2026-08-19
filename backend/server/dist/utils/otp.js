import crypto from "crypto";
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;
export const generateOtp = () => {
    const max = 10 ** OTP_LENGTH;
    return crypto.randomInt(0, max).toString().padStart(OTP_LENGTH, "0");
};
export const hashOtp = (otp) => {
    return crypto.createHash("sha256").update(otp).digest("hex");
};
export const getOtpExpiry = () => {
    return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
};
export const verifyOtp = (otp, hashedOtp) => {
    const hashedInput = hashOtp(otp);
    return crypto.timingSafeEqual(Buffer.from(hashedInput, "hex"), Buffer.from(hashedOtp, "hex"));
};
export const getOtpExpiryMinutes = () => {
    return OTP_EXPIRY_MINUTES;
};
export const getMaxOtpAttempts = () => {
    return MAX_OTP_ATTEMPTS;
};
//# sourceMappingURL=otp.js.map