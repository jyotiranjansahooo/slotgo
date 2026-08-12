import { z } from "zod";
export const refundPaymentSchema = z.object({
    paymentId: z
        .string()
        .min(1, "Payment ID is required."),
    amount: z
        .number()
        .positive("Refund amount must be greater than zero.")
        .optional(),
});
//# sourceMappingURL=refund.validation.js.map