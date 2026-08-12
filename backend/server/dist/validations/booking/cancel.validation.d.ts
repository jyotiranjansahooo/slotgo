import { z } from "zod";
export declare const cancelBookingSchema: z.ZodObject<{
    reason: z.ZodString;
}, z.core.$strip>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
