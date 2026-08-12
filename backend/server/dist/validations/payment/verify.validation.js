import { z } from "zod";
export const verifyPaymentSchema = z.object({
    orderId: z
        .string()
        .min(1, "Razorpay order ID is required."),
    paymentId: z
        .string()
        .min(1, "Razorpay payment ID is required."),
    signature: z
        .string()
        .min(1, "Razorpay signature is required."),
});
//# sourceMappingURL=verify.validation.js.map