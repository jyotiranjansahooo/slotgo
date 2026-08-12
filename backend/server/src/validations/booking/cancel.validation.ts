import { z } from "zod";

export const cancelBookingSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3)
    .max(500),
});

export type CancelBookingInput =
  z.infer<typeof cancelBookingSchema>;