import { z } from "zod";
export declare const resetPasswordSchema: z.ZodObject<{
    email: z.ZodString;
    newPassword: z.ZodString;
    confirmPassword: z.ZodString;
}, z.core.$strip>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
