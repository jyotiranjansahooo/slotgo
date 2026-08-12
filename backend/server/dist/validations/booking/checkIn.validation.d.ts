import { z } from "zod";
export declare const checkInSchema: z.ZodObject<{
    verificationPin: z.ZodString;
}, z.core.$strip>;
export type CheckInInput = z.infer<typeof checkInSchema>;
