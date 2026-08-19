import { z } from "zod";
export declare const verifyOtpSchema: z.ZodObject<{
    email: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    otp: z.ZodString;
}, z.core.$strip>;
