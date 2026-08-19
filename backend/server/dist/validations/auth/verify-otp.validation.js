import { z } from "zod";
export const verifyOtpSchema = z.object({
    email: z
        .string()
        .email("Enter a valid email address.")
        .transform((value) => value.trim().toLowerCase()),
    otp: z
        .string()
        .regex(/^\d{6}$/, "OTP must contain exactly 6 digits."),
});
//# sourceMappingURL=verify-otp.validation.js.map