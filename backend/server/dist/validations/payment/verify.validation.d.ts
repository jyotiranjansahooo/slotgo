import { z } from "zod";
export declare const verifyPaymentSchema: z.ZodObject<{
    orderId: z.ZodString;
    paymentId: z.ZodString;
    signature: z.ZodString;
}, z.core.$strip>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
