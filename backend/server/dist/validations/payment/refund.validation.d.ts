import { z } from "zod";
export declare const refundPaymentSchema: z.ZodObject<{
    paymentId: z.ZodString;
    amount: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;
