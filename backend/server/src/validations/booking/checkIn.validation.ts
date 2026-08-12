import { z } from "zod";

export const checkInSchema = z.object({
  verificationPin: z
    .string()
    .trim()
    .min(4)
    .max(10),
});

export type CheckInInput =
  z.infer<typeof checkInSchema>;