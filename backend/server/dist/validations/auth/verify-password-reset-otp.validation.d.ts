import { z } from "zod";
export declare const verifyPasswordResetOtpSchema: z.ZodObject<{
    email: z.ZodString;
    otp: z.ZodString;
}, z.core.$strip>;
export type VerifyPasswordResetOtpInput = z.infer<typeof verifyPasswordResetOtpSchema>;
