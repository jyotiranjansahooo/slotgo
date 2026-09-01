import { z } from "zod";
export const verifyPasswordResetOtpSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Please provide a valid email address."),
    otp: z
        .string()
        .trim()
        .regex(/^\d{6}$/, "OTP must be exactly 6 digits."),
});
//# sourceMappingURL=verify-password-reset-otp.validation.js.map