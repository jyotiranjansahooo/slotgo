import { z } from "zod";
export declare const createPaymentSchema: z.ZodObject<{
    bookingId: z.ZodString;
}, z.core.$strip>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
