import { z } from "zod";

export const createPaymentSchema = z.object({
  bookingId: z
    .string()
    .min(1, "Booking ID is required."),
});

export type CreatePaymentInput =
  z.infer<typeof createPaymentSchema>;